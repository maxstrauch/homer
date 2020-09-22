import { dispatchEvent } from "../endpoints/events";

export async function initHooks() {
    return true; // Always ready!
}

export function onAction(event: string, payload: any) {
    dispatchEvent(event, payload);
}