import type { CollabApiProvider } from "@collab-api/provider";
import test from "ava";

import { newCollabApi, newCollabApiProvider } from "../utils/index.ts";

test("executes the beforeUnloadDocument callback", async (t) => {
	// biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
	await new Promise(async (resolve) => {
		const server = await newCollabApi(t, {
			async beforeUnloadDocument() {
				t.pass();
				resolve("done");
			},
		});

		const p = newCollabApiProvider(t, server, {
			onSynced(data) {
				p.destroy();
			},
		});
	});
});

test("executes the beforeUnloadDocument callback when all clients disconnect after a document was loaded", async (t) => {
	// biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
	await new Promise(async (resolve) => {
		// eslint-disable-next-line prefer-const
		let provider: CollabApiProvider;

		class CustomExtension {
			async afterLoadDocument() {
				provider.destroy();
			}

			async beforeUnloadDocument() {
				t.pass();
				resolve("done");
			}
		}

		const server = await newCollabApi(t, {
			extensions: [new CustomExtension()],
		});

		provider = newCollabApiProvider(t, server);
	});
});

test("throwing an exception in beforeUnloadDocument prevents a document from being unloaded", async (t) => {
	// biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
	await new Promise(async (resolve) => {
		// eslint-disable-next-line prefer-const
		let provider: CollabApiProvider;

		class CustomExtension {
			async beforeUnloadDocument() {
				throw new Error("my custom error");
			}

			async afterUnloadDocument() {
				t.fail("should not be called");
			}
		}

		const server = await newCollabApi(t, {
			extensions: [new CustomExtension()],
		});

		const p = newCollabApiProvider(t, server, {
			onSynced(data) {
				p.destroy();
			},
		});

		setTimeout(() => {
			t.is(server.documents.size, 1);
			t.pass();
			resolve("done");
		}, 500);
	});
});
