import express from "express";
import http from "http";
import { Server } from "socket.io";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const QUEUE_KEY = "live:answer_queue";

// redisCmd  — normal commands
// redisWorker — blocked in BLPOP; cannot share with redisCmd
// redisSub  — in subscriber mode for quiz_ended pub/sub
const redisCmd    = new Redis(REDIS_URL);
const redisWorker = new Redis(REDIS_URL);
const redisSub    = new Redis(REDIS_URL);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

// ── key helpers ───────────────────────────────────────────────────────────────
const leaderboardKey    = (quizId) => `live:quiz:${quizId}:leaderboard`;
const studentNamesKey   = (quizId) => `live:quiz:${quizId}:students`;
const quizEndedChannelKey = (quizId) => `live:quiz:${quizId}:ended`;

// ── socket rooms ──────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
    console.log("[ws] connected:", socket.id);

    // Student/Educator joins a quiz room
    socket.on("join_quiz", ({ quiz_id }) => {
        if (!quiz_id) return;
        const room = `quiz:${quiz_id}`;
        socket.join(room);
        console.log(`[ws] ${socket.id} joined ${room}`);
        // Subscribe to quiz_ended for this quiz (idempotent)
        redisSub.subscribe(quizEndedChannelKey(quiz_id));
        // Push current leaderboard snapshot immediately to the joining socket
        buildLeaderboardSnapshot(quiz_id)
            .then((leaderboard) => socket.emit("leaderboard_update", { quiz_id, leaderboard }))
            .catch(() => {});
    });

    socket.on("leave_quiz", ({ quiz_id }) => {
        socket.leave(`quiz:${quiz_id}`);
    });

    socket.on("disconnect", () => {
        console.log("[ws] disconnected:", socket.id);
    });
});

// ── pub/sub: only used for quiz_ended (published by endlivequiz Next.js route) ─
redisSub.on("message", (channel, message) => {
    const m = channel.match(/^live:quiz:(\d+):ended$/);
    if (!m) return;
    const quizId = m[1];
    try {
        const data = JSON.parse(message);
        io.to(`quiz:${quizId}`).emit("quiz_ended", data);
        console.log(`[ws] quiz_ended → room quiz:${quizId}`);
    } catch { /* malformed */ }
});

// ── snapshot builder ──────────────────────────────────────────────────────────
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

// ── queue worker ──────────────────────────────────────────────────────────────
// Dequeues answer jobs, updates the leaderboard sorted set,
// then broadcasts the updated snapshot directly to the socket.io room.
async function runWorker() {
    console.log("[worker] started, listening on", QUEUE_KEY);
    while (true) {
        try {
            const result = await redisWorker.blpop(QUEUE_KEY, 0);
            if (!result) continue;

            const { quiz_id, student_id, points_earned } = JSON.parse(result[1]);

            // Update leaderboard sorted set
            await redisCmd.zincrby(leaderboardKey(quiz_id), points_earned, String(student_id));

            // Build ranked snapshot and push to everyone in the room
            const leaderboard = await buildLeaderboardSnapshot(quiz_id);
            io.to(`quiz:${quiz_id}`).emit("leaderboard_update", { quiz_id, leaderboard });
            console.log(`[worker] quiz ${quiz_id}: broadcast to room — ${leaderboard.length} entries`);
        } catch (err) {
            console.error("[worker] error:", err);
            await new Promise((r) => setTimeout(r, 1000));
        }
    }
}

runWorker();
server.listen(8002, () => console.log("[ws] server on port 8002"));
