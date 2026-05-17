import type { ExecutionContext } from "ava";
import type { CollabApiProviderWebsocketConfiguration } from "@collab-api/provider";
import { CollabApiProviderWebsocket } from "@collab-api/provider";
import type { CollabApi } from "@collab-api/server";

export const newCollabApiProviderWebsocket = (
	t: ExecutionContext,
	collabApi: CollabApi,
	options: Partial<Omit<CollabApiProviderWebsocketConfiguration, "url">> = {},
) => {
	const ws = new CollabApiProviderWebsocket({
		// We don't need which port the server is running on, but
		// we can get the URL from the passed server instance.
		url: collabApi.server!.webSocketURL,
		// Node.js 22+ has native WebSocket support
		...options,
	});

	t.teardown(() => ws.destroy());

	return ws;
};
