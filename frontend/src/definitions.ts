export type EmployeeStateTransision = {
    employeeId: string;
    actionAt: string;
    targetState: string;
}

export const LAST_STATE_TRANSISIONS_KEY = "lastStateTransisitions";
export const LAST_STATE_TRANSISIONS_MAX = 10;