import { Logger } from "@collab-api/extension-logger";
import { CollabApi, type WebSocketLike } from "@collab-api/server";
import { createServer } from "node:http";
import crossws from "crossws/adapters/node";
import Koa from "koa";

const collabApi = new CollabApi({
	extensions: [new Logger()],
});

const app = new Koa();

app.use(async (ctx) => {
	ctx.body = "Hello World!";
});

const server = createServer(app.callback());

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

server.listen(1234);
