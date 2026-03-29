export interface UpdateUserRequest {
    fullName: string;
    email: string;
    active?: boolean | null;
}