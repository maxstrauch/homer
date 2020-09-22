import debug from 'debug';

export type Logger = {
    info: debug.Debugger;
    debug: debug.Debugger;
    warn: debug.Debugger;
    error: debug.Debugger;
    log: debug.Debugger;
}

const LEVEL_MAP = [
    {
        key: 'info',
        writer: console.info,
    },
    {
        key: 'debug',
        writer: console.debug,
    },
    {
        key: 'log',
        writer: console.log,
    },
    {
        key: 'error',
        writer: console.error,
    },
    {
        key: 'warn',
        writer: console.warn,
    },
];

export function createLogger(namespace?: string): Logger {
    const ret = { };
  
    for (let block of LEVEL_MAP) {
        // @ts-ignore
        ret[block.key] = function(...args) {
            const stream = debug(`app:${namespace}`);
            stream.log = block.writer.bind(console);
            stream.apply(null, [block.key, ...args]);
        };
    }

    return ret as Logger;
}
