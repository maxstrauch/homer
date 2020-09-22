export async function initHooks() {
    return true; // Always ready!
}

export function onAction(event: string, payload: any) {
    console.log(`=== Webhook stdout event ===`);
    console.log(`Event=${event}`);
    console.log(`Payload=`);
    console.log(JSON.stringify(payload, null, 4));
    console.log(`===`);
}