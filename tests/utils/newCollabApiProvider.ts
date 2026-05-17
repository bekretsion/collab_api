import type { ExecutionContext } from "ava";
import {
	CollabApiProvider,
	type CollabApiProviderConfiguration,
	type CollabApiProviderWebsocket,
	type CollabApiProviderWebsocketConfiguration,
} from "@collab-api/provider";
import type { CollabApi } from "@collab-api/server";
import { newCollabApiProviderWebsocket } from "./newCollabApiProviderWebsocket.ts";

export const newCollabApiProvider = (
	t: ExecutionContext,
	server: CollabApi,
	options: Partial<CollabApiProviderConfiguration> = {},
	websocketOptions: Partial<CollabApiProviderWebsocketConfiguration> = {},
	websocketProvider?: CollabApiProviderWebsocket,
): CollabApiProvider => {
	const provider = new CollabApiProvider({
		websocketProvider:
			websocketProvider ??
			newCollabApiProviderWebsocket(t, server, websocketOptions),
		// Just use a generic document name for all tests.
		name: "collab-api-test",
		// Add or overwrite settings, depending on the test case.
		...options,
	});
	provider.attach();

	t.teardown(() => provider.destroy());

	return provider;
};
