import { WebSocket, WebSocketServer as Server } from "ws";
import EventEmitter from "events";


type Connection = WebSocket;


type Listener = {
    kind: string,
    handler: (conn: Connection, msg: Record<string, unknown>) => void;
}

const try_json = (msg: string):Record<string, unknown> | null => {
    try {
        return JSON.parse(msg);
    }
    catch {
        console.error("Error parsing JSON");
        return null;
    }
};

class SocketServer {

    private server:  Server;
    private connections: Connection[];

    public events: EventEmitter;

    private listeners: Listener[];

    constructor() {
        this.connections = [];
        this.events = new EventEmitter();
        this.listeners = [];

        this.server = new Server({
            port: 3337,
        });

        this.server.on('connection', (connection: Connection) => {
            const i = this.connections.push(connection);
            this.events.emit('connected', { index: i, conn: connection });
            
            connection.on("message", (msg: string) => {
                
                this.process_message(connection, msg);
            });

            connection.on("close", () => {
                this.connections.splice(i, 1);
                this.events.emit('closed', { index: i, conn: connection });
            });
        });
    }

    set message(message: Record<string, unknown>) {
        for (const connection of this.connections) {
            connection.send(JSON.stringify(message), (e) => {
                if (e === undefined) return;
                console.error(e);
            });
        }
    }

    send(sender: Connection, message: Record<string, unknown>) {
        for (const connection of this.connections) {
            if (connection === sender) continue;
            connection.send(JSON.stringify(message), (e) => {
                if (e === undefined) return;
                console.error(e);
            });
        }
    }

    send_specific(index: number, message: Record<string, unknown>) {
        this.connections[index].send(JSON.stringify(message));
    }

    private async process_message(c: Connection, msg: string) {
        const parsed = try_json(msg);
        if (parsed === null) return;
        if ("kind" in parsed) {
            for (const listener of this.listeners) {
                if (listener.kind === parsed.kind) {
                    listener.handler(c, parsed);
                    return;
                }
            }
        } else {
            console.error("Message kind unknown.");
        }
    }

    add_listener(kind: string, method: (conn: Connection, msg: Record<string, unknown>) => void) {
        for (const listener of this.listeners) {
            if (listener.kind === kind) {
                console.error("listener with same name found.");
                return;
            }
        }
        this.listeners.push({ kind: kind, handler: method });
    }

}

export default new SocketServer();
