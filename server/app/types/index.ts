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