import Redis from "ioredis";

// Singleton Redis client shared across the Next.js server process.
// The connection string must be set in the environment as REDIS_URL.
// Example: redis://localhost:6379
const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis: Redis =
    globalForRedis.redis ??
    new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
        lazyConnect: false,
        maxRetriesPerRequest: 3,
    });

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
}

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
