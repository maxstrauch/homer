import { createLogger } from './logger.service';

export type SubscribeCallback<T> = (payload: T, event?: string) => void;
export type Unsubscribe = {
    unsubscribe: (() => void)
};

const logger = createLogger(`EventService`);

export const TOPIC_EMPLOYEE_STATE_CHANGE = 'onEmployeeStateChange';

export class EventService {

    private static subscribers: Array<{
        id: number;
        event: string;
        // @ts-ignore
        callback: SubscribeCallback<any>;
    }> = [];

    static subscribe<T>(event: string, callback: SubscribeCallback<T>): Unsubscribe {
        const id = Date.now();

        EventService.subscribers.push({
            id, event, callback
        });

        // Unsubscribe
        return {
            unsubscribe: () => {
                EventService.subscribers = EventService.subscribers.filter(p => p.id !== id);
            },
        };
    }

    static emit<T>(event: string, payload: T) {
        for (let sub of EventService.subscribers) {
            if (event === sub.event && sub.callback) {
                try {
                    sub.callback(payload, event);
                } catch (ex) {
                    logger.error(`Error in emit() for ${event}:`, ex, payload);
                }
            }
        }
    }

}

