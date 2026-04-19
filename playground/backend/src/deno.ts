// @ts-nocheck - Deno types not installed
import { CollabApi } from "@collab-api/server";
const collabApi = new CollabApi({
	name: "collaboration",
});

Deno.serve((req) => {
	if (req.headers.get("upgrade") !== "websocket") {
		return new Response(null, { status: 501 });
	}

	const { socket, response } = Deno.upgradeWebSocket(req);

	socket.binaryType = "arraybuffer";

	const clientConnection = collabApi.handleConnection(socket, req);

	socket.addEventListener("message", (event) => {
		clientConnection.handleMessage(new Uint8Array(event.data));
	});

	socket.addEventListener("close", (event) => {
		clientConnection.handleClose({ code: event.code, reason: event.reason });
	});

	return response;
});
