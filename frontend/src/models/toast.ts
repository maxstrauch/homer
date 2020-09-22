export interface Toast {
    uid: number;
    text: string;
    duration: number;
    class?: string;
    isShown?: boolean;
    isHiding: boolean;
}