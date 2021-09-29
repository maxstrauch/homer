import axios from "axios";
import { Config } from "../config";
import debug from "debug";
import { EmployeeStateChange } from "../webhooks";
import { States } from "../models/ActivityEntity";

const log = debug(`app:slack-webhook-impl`);

let slackApiUrl: string = null;
let slackChannel: string = null;

const EMOJI_SMILEYS: string[] = ["😎", "🤓", "😛", "🤪", "😜", "🧐", "😌", "😋", "🙂", "😺"];
const EMOJI_PETS: string[] = ["🐶", "🐱", "🐭", "🐹", "🐰", "🐮", "🦁", "🐯", "🐨", "🐼", 
"🐸", "🐵", "🦊", "🐻", "🦉", "🦋", "🐌", "🐞", "🐣", "🐗", "🐴", "🦄", "🦐", "🦑", "🐬", "🐆", "🐎", "🐕"];
const EMOJI_HANDS: string[] = ["🤛", "🤲", "👍", "🙌", "👏", "👋", "🤚", "🖐", "🖖"];
const EMOJI_BREAK: string[] = ["🍩", "🍪", "🎂", "🥨", "🧀", "🍖", "🥩", "🍕", "🍟", "🥘", "🥗", "🍤", "🍽", "🍼"];

interface ExternalSlackMessage {
    channel: string;
    link_names: number;
    username: string;
    text: string;
}

async function transmitMessage(text: string) {
    try {
        const payload: ExternalSlackMessage = {
            channel: slackChannel,
            link_names: 1,
            username: 'Homeoffice App',
            text,
        };

        await axios.post(slackApiUrl, payload);

        log(`Slack message dispatched:`, payload);
    } catch (ex) {
        log(`Cannot dispatch slack message:`, ex);
    }
}

function getRandEmoji(...arr: string[][]) {
    try {
        const i = Math.max(0, Math.min(Math.floor(Math.random() * arr.length), arr.length - 1));
        const j = Math.max(0, Math.min(Math.floor(Math.random() * arr[i].length), arr[i].length - 1));
        return arr[i][j];
    } catch (ex) {
        return '🚨';
    }
}

function triggerIf(evt: EmployeeStateChange, oldState: States[], newState: States[], message: string): boolean {
    if (oldState.indexOf(evt.oldState) > -1 && newState.indexOf(evt.newState) > -1) {
        transmitMessage(message).then(() => { /* OK */ });
        return true;
    }
    return false;
}

export async function initHooks() {
    slackApiUrl = Config.SLACK_API_URL;
    slackChannel = Config.SLACK_CHANNEL_NAME;

    if (!slackApiUrl) {
        throw new Error(`Missing env parameter 'SLACK_API_URL'!`);
    }

    if (!slackChannel) {
        throw new Error(`Missing env parameter 'SLACK_CHANNEL_NAME'!`);
    }

    log(`Ready, sending messages to ${slackApiUrl.substring(0, 20)}..., channel: ${slackChannel}`);

    return true;
}

export async function onAction(event: string, evt: EmployeeStateChange) {

    let umsg = '';
    if (evt.description) {
        umsg = `\n_Nachricht von ${evt.employee.name}:_ ` + (evt.description.length > 144 ? evt.description.substring(0, 144) : evt.description);
    }

    // If user comes online into the homeoffice
    if (triggerIf(
        evt, 
        [ States.OFFLINE, null ], 
        [ States.HOMEOFFICE ],
        `${evt.employee.name} ist jetzt im Homeoffice anwesend ${getRandEmoji(EMOJI_SMILEYS, EMOJI_PETS)}${umsg}`
    )) {
        return;
    }

    // If user comes online in the office
    if (triggerIf(
        evt, 
        [ States.OFFLINE, null ], 
        [ States.OFFICE ],
        `${evt.employee.name} ist jetzt im Büro anwesend ${getRandEmoji(EMOJI_SMILEYS, EMOJI_PETS)}${umsg}`
    )) {
        return;
    }

    // If user comes online into the customer office
    if (triggerIf(
        evt, 
        [ States.OFFLINE, null ], 
        [ States.CUSTOMER ],
        `${evt.employee.name} ist jetzt anwesend und beim Kunden ${getRandEmoji(EMOJI_SMILEYS, EMOJI_PETS)}${umsg}`
    )) {
        return;
    }   

    // If user leaves
    if (triggerIf(
        evt,
        [ States.CUSTOMER, States.PAUSE, States.HOMEOFFICE, States.OFFICE ],
        [ States.OFFLINE ],
        `${evt.employee.name} ist jetzt raus ${getRandEmoji(EMOJI_HANDS)}${umsg}`
    )) {
        return;
    }

    // If user goes to break
    if (triggerIf(
        evt,
        [ States.CUSTOMER, States.OFFLINE, States.HOMEOFFICE, States.OFFICE ],
        [ States.PAUSE ],
        `${evt.employee.name} macht mal Pause ${getRandEmoji(EMOJI_BREAK)}${umsg}`
    )) {
        return;
    }

    // If user comes back
    if (triggerIf(
        evt,
        [ States.PAUSE ],
        [ States.CUSTOMER, States.OFFLINE, States.HOMEOFFICE, States.OFFICE ],
        `${evt.employee.name} ist wieder da ${getRandEmoji(EMOJI_SMILEYS, EMOJI_PETS)}${umsg}`
    )) {
        return;
    }

    // Any other ...
    const getReadableState = (rawState: States): string => {
        switch (rawState) {
            case States.PAUSE:
                return 'Pause';
            case States.OFFLINE:
                return 'Abwesend';
            case States.HOMEOFFICE:
                return 'Im Homeoffice';
            case States.OFFICE:
                return 'Im Büro';
            case States.CUSTOMER:
                return 'Beim Kunden';
            default:
                return "Unbekannter Status";
        }
    };

    transmitMessage(
        `${evt.employee.name} wechselt von "${getReadableState(evt.oldState)}" nach "${getReadableState(evt.newState)}"${umsg}`
    ).then(() => { /* OK */ });
}