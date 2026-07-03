export interface ContactSubmission {
    id: string;
    name: string;
    phone: string;
    message: string;
    createdAt: string;
    read: boolean;
}

export interface ContactSettings {
    awayEnabled: boolean;
    awayFrom: string;
    awayUntil: string;
}
