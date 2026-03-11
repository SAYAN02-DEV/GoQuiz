import Redis from "ioredis";

// Singleton Redis client shared across the Next.js server process.
// The connection string must be set in the environment as REDIS_URL.
// Example: rediss://:password@host:6380  (Upstash / Redis Cloud / etc.)
const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

function createRedisClient(): Redis {
    const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
    });
    // Prevent unhandled-error crashes; errors are surfaced per-command instead.
    client.on("error", (err) => {
        console.error("[redis] connection error:", err.message);
    });
    return client;
}

export const redis: Redis = globalForRedis.redis ?? createRedisClient();

// Keep the singleton alive across hot-reloads in dev AND across invocations in prod.
globalForRedis.redis = redis;

// ─── key helpers ──────────────────────────────────────────────────────────────

export const RedisKeys = {
    /** Serialised quiz + questions meta (no answers stripped — worker uses this) */
    quizMeta: (quizId: number) => `live:quiz:${quizId}:meta`,

    /** Sorted set  member = student_id (string)  score = accumulated points */
    leaderboard: (quizId: number) => `live:quiz:${quizId}:leaderboard`,

    /** Hash  field = student_id  value = student display name */
    studentNames: (quizId: number) => `live:quiz:${quizId}:students`,

    /** Hash  field = question_id  value = JSON-serialised raw answer */
    attemptAnswers: (quizId: number, studentId: number) =>
        `live:quiz:${quizId}:attempt:${studentId}:answers`,

    /** String  value = accumulated points (integer) */
    attemptPoints: (quizId: number, studentId: number) =>
        `live:quiz:${quizId}:attempt:${studentId}:points`,

    /** List used as a FIFO queue — RPUSH to enqueue, BLPOP to dequeue */
    answerQueue: () => `live:answer_queue`,

    /** Pub/sub channel for broadcasting leaderboard snapshots */
    leaderboardChannel: (quizId: number) => `live:quiz:${quizId}:updates`,

    /** Pub/sub channel published when educator ends the quiz.
     *  Payload: JSON array of { student_id, attempt_id } */
    quizEndedChannel: (quizId: number) => `live:quiz:${quizId}:ended`,
} as const;

// ─── shared types stored in Redis ─────────────────────────────────────────────

export interface QuizMeta {
    quiz_id: number;
    title: string;
    questions: QuestionMeta[];
}

export interface QuestionMeta {
    question_id: number;
    question_type: number; // 1=SCQ 2=MCQ 3=Integer
    correct_points: number;
    negative_points: number;
    options: OptionMeta[];
    correct_integer_answer: number | null;
}

export interface OptionMeta {
    option_id: number;
    is_correct: boolean;
}

export interface AnswerQueueItem {
    quiz_id: number;
    student_id: number;
    question_id: number;
    question_type: number;
    /** SCQ: single option_id */
    option_id: number | null;
    /** MCQ: list of option_ids */
    selected_option_ids: number[];
    /** Integer */
    integer_answer: number | null;
    points_earned: number;
}
