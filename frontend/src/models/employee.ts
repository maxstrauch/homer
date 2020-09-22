export interface Employee {
    id: string;
    email: string;
    name: string;
    abbr: string;
    createdAt: string;
    updatedAt: string;
    avatarUrl: string | null;
    state: EmployeeState;
}

export interface EmployeeState {
    state: string;
    description: string;
    updatedAt: string;
}

export function EMPTY_EMPLOYEE(): Employee {
    return {
        avatarUrl: '',
        name: '',
        email: '',
        abbr: ''
    } as Employee;
}

export interface UpdateEmployeeStateRequest {
    state: string;
    description?: string;
}