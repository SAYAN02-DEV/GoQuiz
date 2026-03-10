export interface CreateClassRequest {
    className: string;
    secretKey: string;
}

export interface CreateQuizRequest {
    quizName: string;
    classId: number;
    isLive: boolean;
    dueDate: Date;
    isResultOut: boolean
}

export interface JoinClass{
    classId: number
    secretKey: String
}

export interface PastQuiz{
    quizId: number
}

export interface PastTestSubmit{
    attemptId: number
}

export interface OptionInput {
    text: string;
    image_link?: string;
    is_correct: boolean;
}

export interface QuestionInput {
    text: string;
    image_link?: string;
    question_type: number; // 1=SCQ, 2=MCQ, 3=Integer
    correct_points: number;
    negative_points: number;
    correct_integer_answer?: number;
    options: OptionInput[];
}

export interface CreateQuestionsRequest {
    quiz_id: number;
    questions: QuestionInput[];
}

export interface SubmitAnswerRequest {
    attempt_id: number;
    question_id: number;
    // SCQ: provide option_id
    option_id?: number;
    // MCQ: provide selected_option_ids
    selected_option_ids?: number[];
    // Integer: provide integer_answer
    integer_answer?: number;
}