export interface SignupRequest {
    username: string;
    password: string;
    fullName: string;
    email: string;
    adminSecret?: string | null;
}