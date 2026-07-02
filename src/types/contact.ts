export interface ContactSubmission {
    id: string;
    name: string;
    phone: string;
    message: string;
    createdAt: string;
}

export interface ContactSettings {
    awayEnabled: boolean;
    awayFrom: string;
    awayUntil: string;
}
