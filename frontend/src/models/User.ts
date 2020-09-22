export interface User {
    id: string;
    name: string;
    roles: string[];
    directLoginUrl: string | null;
    optional: { [key: string]: string | number | boolean; };
}

export interface CreateUser {
    name: string;
    roles: string[];
}