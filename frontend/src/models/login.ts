export interface LoginRequest {
    name: string;
    password: string;
}

export interface LoginResponse {
    data: LoginToken;
    token: string;
}

export interface LoginToken {
    id: string;
    name: string;
    roles: string[];
    exp: number;
    isKioskView?: boolean; // TODO: check if present always
} 