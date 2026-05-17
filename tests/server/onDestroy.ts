import test from "ava";
import { newCollabApi, newCollabApiProvider } from "../utils/index.ts";
import { retryableAssertion } from "../utils/retryableAssertion.ts";

test("executes the onDestroy hook and has the instance", async (t) => {
	await new Promise(async (resolve) => {
		const collabApi = await newCollabApi(t, {
			async onDestroy({ instance }) {
				t.is(instance, collabApi);

				resolve("done");
			},
		});

		await collabApi.server!.destroy();
	});
});

test("destroy works if no document is open", async (t) => {
	await new Promise(async (resolve) => {
		const collabApi = await newCollabApi(t);

		await collabApi.server!.destroy();

		t.pass();
		resolve("");
	});
});

test("executes the onDestroy hook from a custom extension", async (t) => {
	await new Promise(async (resolve) => {
		class CustomExtension {
			async onDestroy() {
				t.pass();

				resolve("done");
			}
		}

		const collabApi = await newCollabApi(t, {
			extensions: [new CustomExtension()],
		});

		await collabApi.server!.destroy();
	});
});

test("destroy closes all connections", async (t) => {
	await new Promise(async (resolve) => {
		const collabApi = await newCollabApi(t);

		const provider1 = newCollabApiProvider(t, collabApi);

		await retryableAssertion(t, (t2) => t2.is(provider1.synced, true));

		t.is(collabApi.getConnectionsCount(), 1);
		t.is(collabApi.getDocumentsCount(), 1);

		await collabApi.server!.destroy();

		t.is(collabApi.getConnectionsCount(), 0);
		t.is(collabApi.getDocumentsCount(), 0);

		resolve("");
	});
});

test("destroy does not call onStoreDocument if nothing debounced", async (t) => {
	await new Promise(async (resolve) => {
		const server = await newCollabApi(t, {
			async onStoreDocument() {
				t.fail();
			},
		});

		const provider = newCollabApiProvider(t, server);

		await retryableAssertion(t, (t2) => t2.is(provider.synced, true));

		await server.server!.destroy();

		resolve("");
	});
});

test("destroy does not call onStoreDocument after debounced onStoreDocument executes", async (t) => {
	await new Promise(async (resolve) => {
		let called = 0;

		const server = await newCollabApi(t, {
			debounce: 200,
			unloadImmediately: true,
			async onStoreDocument() {
				called += 1;
			},
		});

		const provider = newCollabApiProvider(t, server, {
			onSynced() {
				// Dummy change to trigger onStoreDocument
				provider.document.getArray("foo").push(["foo"]);
			},
		});

		await retryableAssertion(t, (t2) => t2.is(provider.synced, true));

		// Wait for the debounced onStoreDocument to execute
		await new Promise((r) => setTimeout(r, 400));

		await server.server!.destroy();

		t.is(called, 1);

		resolve("");
	});
});

test("destroy calls onStoreDocument before returning if debounced", async (t) => {
	await new Promise(async (resolve) => {
		let called = false;

		const collabApi = await newCollabApi(t, {
			async onStoreDocument() {
				called = true;
			},
		});

		const provider = newCollabApiProvider(t, collabApi, {
			onSynced() {
				// Dummy change to trigger onStoreDocument
				provider.document.getArray("foo").push(["foo"]);
			},
		});

		const provider1 = newCollabApiProvider(t, collabApi);

		await retryableAssertion(t, (t2) => t2.is(provider1.synced, true));

		t.is(called, false);
		await collabApi.server!.destroy();
		t.is(called, true);

		resolve("");
	});
});

test("destroy calls onStoreDocument before returning, even with unloadImmediately=false if debounced", async (t) => {
	await new Promise(async (resolve) => {
		let called = false;

		const collabApi = await newCollabApi(t, {
			async onStoreDocument() {
				called = true;
			},
			unloadImmediately: false,
		});

		const provider = newCollabApiProvider(t, collabApi, {
			onSynced() {
				// Dummy change to trigger onStoreDocument
				provider.document.getArray("foo").push(["foo"]);
			},
		});

		const provider1 = newCollabApiProvider(t, collabApi);

		await retryableAssertion(t, (t2) => t2.is(provider1.synced, true));
		await retryableAssertion(t, (t2) => t2.is(provider.synced, true));

		t.is(called, false);
		await collabApi.server!.destroy();
		t.is(called, true);

		resolve("");
	});
});

test("destroy calls onStoreDocument before returning, even with unloadImmediately=false, with multiple docs if debounced", async (t) => {
	await new Promise(async (resolve) => {
		let called = 0;

		const collabApi = await newCollabApi(t, {
			async onStoreDocument() {
				called += 1;
			},
			unloadImmediately: false,
		});

		const provider1 = newCollabApiProvider(t, collabApi, {
			name: "test1",
			onSynced() {
				provider1.document.getArray("foo").push(["foo"]);
			},
		});
		const provider2 = newCollabApiProvider(t, collabApi, {
			name: "test2",
			onSynced() {
				provider2.document.getArray("foo").push(["foo"]);
			},
		});
		const provider3 = newCollabApiProvider(t, collabApi, {
			name: "test3",
			onSynced() {
				provider3.document.getArray("foo").push(["foo"]);
			},
		});

		await retryableAssertion(t, (t2) => t2.is(provider1.synced, true));
		await retryableAssertion(t, (t2) => t2.is(provider2.synced, true));
		await retryableAssertion(t, (t2) => t2.is(provider3.synced, true));

		// Wait for all changes to reach the server and trigger debounced stores
		await retryableAssertion(t, (t2) => {
			t2.true(collabApi.debouncer.isDebounced("onStoreDocument-test1"));
			t2.true(collabApi.debouncer.isDebounced("onStoreDocument-test2"));
			t2.true(collabApi.debouncer.isDebounced("onStoreDocument-test3"));
		});

		t.is(called, 0);
		await collabApi.server!.destroy();
		await retryableAssertion(t, (t2) => t2.is(called, 3));

		resolve("");
	});
});

test("destroy calls onStoreDocument before returning, with multiple docs if debounced", async (t) => {
	await new Promise(async (resolve) => {
		let called = 0;

		const collabApi = await newCollabApi(t, {
			async onStoreDocument() {
				called += 1;
			},
			unloadImmediately: true,
		});

		const provider1 = newCollabApiProvider(t, collabApi, {
			name: "test1",
			onSynced() {
				provider1.document.getArray("foo").push(["foo"]);
			},
		});
		const provider2 = newCollabApiProvider(t, collabApi, {
			name: "test2",
			onSynced() {
				provider2.document.getArray("foo").push(["foo"]);
			},
		});
		const provider3 = newCollabApiProvider(t, collabApi, {
			name: "test3",
			onSynced() {
				provider3.document.getArray("foo").push(["foo"]);
			},
		});

		await retryableAssertion(t, (t2) => t2.is(provider1.synced, true));
		await retryableAssertion(t, (t2) => t2.is(provider2.synced, true));
		await retryableAssertion(t, (t2) => t2.is(provider3.synced, true));

		// Wait for all changes to reach the server and trigger debounced stores
		await retryableAssertion(t, (t2) => {
			t2.true(collabApi.debouncer.isDebounced("onStoreDocument-test1"));
			t2.true(collabApi.debouncer.isDebounced("onStoreDocument-test2"));
			t2.true(collabApi.debouncer.isDebounced("onStoreDocument-test3"));
		});

		t.is(called, 0);
		await collabApi.server!.destroy();

		await retryableAssertion(t, (t2) => t2.is(called, 3));

		resolve("");
	});
});
