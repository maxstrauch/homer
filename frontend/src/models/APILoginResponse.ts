export interface SessionInfo {
    id: string;
    name: string;
    roles: string[];
    isKioskView?: boolean;
}

export interface APILoginResponse {
    token: string;
    data: SessionInfo;
}

export interface SSOEnabledResponse {
    isSupported: boolean;
    authRedirectUrl: string;
    name: string;
}