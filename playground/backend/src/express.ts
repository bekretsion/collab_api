import { Logger } from "@collab-api/extension-logger";
import { CollabApi, type WebSocketLike } from "@collab-api/server";
import { createServer } from "node:http";
import crossws from "crossws/adapters/node";
import express from "express";

const collabApi = new CollabApi({
	extensions: [new Logger()],
});

const app = express();

app.get("/", (request, response) => {
	response.send("Hello World!");
});

const server = createServer(app);

const ws = crossws({
	hooks: {
		open(peer) {
			const clientConnection = collabApi.handleConnection(
				peer.websocket as unknown as WebSocketLike,
				peer.request as Request,
				{ user_id: 1234 },
			);
			(peer as any)._collabApi = clientConnection;
		},
		message(peer, message) {
			(peer as any)._collabApi?.handleMessage(message.uint8Array());
		},
		close(peer, event) {
			(peer as any)._collabApi?.handleClose({
				code: event.code,
				reason: event.reason,
			});
		},
		error(peer, error) {
			console.error("WebSocket error for peer:", peer.id);
			console.error(error);
		},
	},
});

server.on("upgrade", (request, socket, head) => {
	ws.handleUpgrade(request, socket, head);
});

server.listen(1234, () => console.log("Listening on http://127.0.0.1:1234…"));
