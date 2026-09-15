export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    email: string;
}
