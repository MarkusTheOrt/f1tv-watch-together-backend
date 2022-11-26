import WebSocket from "ws";
import { Server } from "../prelude.js";

const is_host = (msg: Record<string, unknown>): boolean => {
    return ("pw" in msg && msg.pw === "abc123")
};

const type_guard = (msg: Record<string, unknown>, ...types: string[]):boolean => {
    for (const type of types) {
        if (!(type in msg)) return false;
    }
    return true;
}

const acknowledge = (conn: WebSocket.WebSocket) => {
    conn.send(JSON.stringify({ kind: "acknowledged" }));
}

const Application = async () => {
    const app_state = {
        playback: "pause",
        time: 0,
    }
    console.log("Server started on port 3337");
    Server.add_listener("host_playback", (from, msg) => {
        if (!is_host(msg)) return;
        if (!type_guard(msg, "playback_event")) return;

        app_state.playback = msg.playback_event as string;
        Server.send(from, { kind: "playback", playback_event: app_state.playback });
        acknowledge(from);
    });

    Server.add_listener("host_duration", (from, msg) => {
        if (!is_host(msg)) return;
        if (!type_guard(msg, "duration")) return;

        app_state.time = msg.duration as number;
        Server.send(from, { kind: "duration", duration: app_state.time });
        acknowledge(from);
    })

    Server.add_listener("host_seek", (from, msg) => {
        if (!is_host(msg)) return;
        if (!type_guard(msg, "seek")) return;
        
        app_state.time = msg.seek as number;
        Server.send(from, { kind: "seek", seek: app_state.time });
        acknowledge(from);
    });

    Server.add_listener("state", (from) => {
        from.send(JSON.stringify({ kind: "new_state", ...app_state }))
    })
}

export default Application;
