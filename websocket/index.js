import express from "express";
import http from "http";
import { Server } from "socket.io";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const QUEUE_KEY = "live:answer_queue";

// Three separate connections: commands, blocking worker, pub/sub subscriber
const redisCmd = new Redis(REDIS_URL);
const redisWorker = new Redis(REDIS_URL);
const redisSub = new Redis(REDIS_URL);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

// ── key helpers (mirrors server/app/lib/redis.ts) ────────────────────────────
const leaderboardKey = (quizId) => `live:quiz:${quizId}:leaderboard`;
const studentNamesKey = (quizId) => `live:quiz:${quizId}:students`;
const channelKey = (quizId) => `live:quiz:${quizId}:updates`;

// ── socket.io: clients join a room per quiz ───────────────────────────────────
io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // Client sends { quiz_id } to subscribe to a quiz leaderboard
    socket.on("join_quiz", ({ quiz_id }) => {
        if (!quiz_id) return;
        socket.join(`quiz:${quiz_id}`);
        console.log(`${socket.id} joined quiz:${quiz_id}`);
    });

    socket.on("leave_quiz", ({ quiz_id }) => {
        socket.leave(`quiz:${quiz_id}`);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
    });
});

// ── pub/sub subscriber: broadcast incoming snapshots to the correct room ──────
redisSub.on("message", (channel, message) => {
    // channel format: live:quiz:{quiz_id}:updates
    const parts = channel.split(":");
    const quizId = parts[2];
    if (!quizId) return;
    try {
        const data = JSON.parse(message);
        io.to(`quiz:${quizId}`).emit("leaderboard_update", data);
    } catch {
        // malformed message — ignore
    }
});

// ── worker: BLPOP queue → update sorted set → publish snapshot ────────────────
async function buildLeaderboardSnapshot(quizId) {
    const raw = await redisCmd.zrevrange(leaderboardKey(quizId), 0, 99, "WITHSCORES");
    const studentIds = [];
    for (let i = 0; i < raw.length; i += 2) studentIds.push(raw[i]);

    const names = studentIds.length
        ? await redisCmd.hmget(studentNamesKey(quizId), ...studentIds)
        : [];

    return studentIds.map((id, idx) => ({
        rank: idx + 1,
        student_id: parseInt(id, 10),
        name: names[idx] ?? `Student ${id}`,
        points: parseInt(raw[idx * 2 + 1], 10),
    }));
}

async function runWorker() {
    console.log("Worker started, listening on", QUEUE_KEY);
    while (true) {
        try {
            // Block until a job arrives (timeout 0 = wait forever)
            const result = await redisWorker.blpop(QUEUE_KEY, 0);
            if (!result) continue;

            const job = JSON.parse(result[1]);
            const { quiz_id, student_id, points_earned } = job;

            // Update leaderboard sorted set
            await redisCmd.zincrby(leaderboardKey(quiz_id), points_earned, String(student_id));

            // Build snapshot and publish
            const leaderboard = await buildLeaderboardSnapshot(quiz_id);
            await redisCmd.publish(
                channelKey(quiz_id),
                JSON.stringify({ quiz_id, leaderboard })
            );

            // Also subscribe to this channel if not already (idempotent in ioredis)
            await redisSub.subscribe(channelKey(quiz_id));
        } catch (err) {
            console.error("Worker error:", err);
            // Brief pause before retrying to avoid tight error loop
            await new Promise((r) => setTimeout(r, 1000));
        }
    }
}

runWorker();
server.listen(8001, () => console.log("WebSocket server on port 8001"));
