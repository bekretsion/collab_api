import { Logger } from "@collab-api/extension-logger";
import { Server } from "@collab-api/server";

const server = new Server({
	port: 8000,
	address: "127.0.0.1",
	name: "collab-api-minimal",
	extensions: [new Logger()],
});

server.listen();
