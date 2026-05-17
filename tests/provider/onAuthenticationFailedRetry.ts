import test from "ava";
import {
	newCollabApi,
	newCollabApiProvider,
	newCollabApiProviderWebsocket,
	sleep,
} from "../utils/index.ts";

test("provider retries auth with token function after initial failure", async (t) => {
	const docName = "superSecretDoc";
	const requiredToken = "SUPER-SECRET-TOKEN";

	const server = await newCollabApi(t, {
		async onAuthenticate({ token, documentName }) {
			if (documentName !== docName) {
				throw new Error();
			}

			if (token !== requiredToken) {
				throw new Error();
			}
		},
	});

	const socket = newCollabApiProviderWebsocket(t, server);

	let tokenCallCount = 0;

	const provider = newCollabApiProvider(t, server, {
		websocketProvider: socket,
		name: docName,
		token: () => {
			tokenCallCount++;
			return tokenCallCount === 1 ? "wrongToken" : requiredToken;
		},
		onAuthenticationFailed() {
			provider.sendToken();
			provider.startSync();
		},
	});

	await sleep(2000);

	t.is(tokenCallCount, 2);
	t.is(provider.isAuthenticated, true);
});

test("second provider with same doc name succeeds after first fails auth", async (t) => {
	const docName = "superSecretDoc";
	const requiredToken = "SUPER-SECRET-TOKEN";

	const server = await newCollabApi(t, {
		async onAuthenticate({ token, documentName }) {
			if (documentName !== docName) {
				throw new Error();
			}

			if (token !== requiredToken) {
				throw new Error();
			}
		},
	});

	const socket = newCollabApiProviderWebsocket(t, server);

	const providerFail = newCollabApiProvider(t, server, {
		websocketProvider: socket,
		token: "wrongToken",
		name: docName,
		onAuthenticated() {
			t.fail("providerFail should not authenticate");
		},
	});

	await sleep(1000);

	const providerOK = newCollabApiProvider(t, server, {
		websocketProvider: socket,
		token: requiredToken,
		name: docName,
		onAuthenticationFailed() {
			t.fail("providerOK should not fail auth");
		},
	});

	await sleep(1000);

	t.is(providerFail.isAuthenticated, false);
	t.is(providerOK.isAuthenticated, true);
});
