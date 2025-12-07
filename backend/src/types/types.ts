export interface User {
    id: number;
    username: string;
    profile_info_id?: number;
    email_address: string;
}

export interface Topic {
    id: number;
    name: string;
    weight: number;
}

export interface Problem {
    id: number;
    difficulty: number;
    topic_id: number;
    problem_text: string;
    is_frq: boolean;
    answer_choices: Record<string, string[]>;
    image_url?: string;
}

export interface ProblemHistoryEntry {
    id: number;
    user_id: number;
    problem_id: number;
    problem_rating: number;
    timestamp: Date;
    is_correct: boolean;
    answer_text: string;
}

export interface TopicHistoryRow {
    problem_id: number;
    is_correct: boolean;
    timestamp: Date;
    topic_id: number;
    difficulty: number;
}