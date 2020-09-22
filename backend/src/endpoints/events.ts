import { Request, Response } from "express";
import { debug } from 'debug';

const logger = debug('app:events');

interface ClientHandle {
    id: number;
    res: Response;
}

let clients: ClientHandle[] = [];

export async function dispatchEvent(evt: string, data: any) {
    clients.forEach(c => c.res.write(`data: ${JSON.stringify({ evt, p: data })}\n\n`))
}

export async function Events(req: Request, res: Response) {

    logger(`New connection from: ${req.ip}`);

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    });

    // Send ready state to client
    const data = `data: ${JSON.stringify({ evt: 'OnConnect' })}\n\n`;
    res.write(data);

    const id = Date.now();
    clients.push({
        id,
        res
    });

    req.on('close', () => {
        logger(`Connection clodes by: ${req.ip}`);
        clients = clients.filter(c => c.id !== id);
    });
}