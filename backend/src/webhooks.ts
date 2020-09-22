import { Config } from "./config";
import fs from "fs-extra";
import debug from "debug";
import path from "path";
import { ExternalEmployeeEntity } from "./models/Employee";
import { States } from "./models/ActivityEntity";

const log = debug(`app:webhooks`);

type WebhookActionFn = ((event: string, data: any) => void);

const listeningHooks: Array<WebhookActionFn> = [];

export interface EmployeeStateChange {
    iat: Date;
    oldState: States;
    newState: States;
    description: string | null;
    employee: ExternalEmployeeEntity;
}

export function dispatchAction(event: string, data: any) {
    listeningHooks.forEach(async (hook: WebhookActionFn) => {
        try {
            await hook(event, data);
        } catch (ex) {
            log(`Error: failed to exec hook. Reason:`);
            log(ex);
        }
    });
}

export async function initHooks() {
    // Extract the hooks to enable (which are existing)
    const hooks = (`events,${Config.ENABLED_WEBHOOKS || ''}`)
        .split(",")
        .filter((str) => (!!str))
        .map((hookName: string): string => {
            return path.resolve(__dirname, `webhooks/${hookName.toLowerCase()}.js`)
        })
        .filter((filePath: string) => {
            return fs.existsSync(filePath);
        });

    let cnt = 0;
    for (let i = 0; i < hooks.length; i++) {
        log(`Enable hook: ${hooks[i]}`);
        const { initHooks, onAction } = require(hooks[i]);
        
        // Try to initialize the hook
        let ready = false;
        try {
            ready = await initHooks();

            if (!ready) {
                throw new Error(`Hook returned not true for ready state!`);
            }
        } catch (ex) {
            log(`Failed to initialize hook:`, ex);
            ready = false;
        }
        
        if (ready) {
            listeningHooks.push(onAction);
            cnt++;
        }
    }
    log(`${cnt} of ${hooks.length} hooks enabled!`);
}