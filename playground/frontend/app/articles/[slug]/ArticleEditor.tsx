"use client";

import { SocketContext1 } from "@/app/SocketContext1";
import { SocketContext2 } from "@/app/SocketContext2";
import CollaborationStatus from "@/app/articles/[slug]/CollaborationStatus";
import CollaborativeEditor from "@/app/articles/[slug]/CollaborativeEditor";
import {
	CollabApiProvider,
	CollabApiProviderWebsocket,
} from "@collab-api/provider";
import { useContext, useEffect, useState } from "react";

export default function ArticleEditor({ slug }: { slug: string }) {
	const socket1 = useContext(SocketContext1);
	const socket2 = useContext(SocketContext2);

	const [provider1, setProvider1] = useState<CollabApiProvider>();
	const [provider2, setProvider2] = useState<CollabApiProvider>();

	useEffect(() => {
		if (!socket1 || !socket2) return;

		const _p1 = new CollabApiProvider({
			websocketProvider: socket1,
			name: slug,
			onOpen: (data) => console.log("Editor 1 onOpen!", data),
			onClose: (data) => console.log("Editor 1 onClose!", data),
			onAuthenticated: (data) => console.log("Editor 1 onAuthenticated!", data),
			onAuthenticationFailed: (data) =>
				console.log("Editor 1 onAuthenticationFailed", data),
			onUnsyncedChanges: (data) =>
				console.log("Editor 1 onUnsyncedChanges", data),
			onStatus(data) {
				console.log("editor 1 onStatus", data);
			},
		});

		const _p2 = new CollabApiProvider({
			websocketProvider: socket2,
			name: slug,
			onOpen: (data) => console.log("Editor 2 onOpen!", data),
			onClose: (data) => console.log("Editor 2 onClose!", data),
			onAuthenticated: (data) => console.log("Editor 2 onAuthenticated!", data),
			onAuthenticationFailed: (data) =>
				console.log("Editor 2 onAuthenticationFailed", data),
			onUnsyncedChanges: (data) =>
				console.log("Editor 2 onUnsyncedChanges", data),
			onStatus(data) {
				console.log("editor 2 onStatus", data);
			},
		});

		setProvider1(_p1);
		setProvider2(_p2);

		return () => {
			_p1.destroy();
			_p2.destroy();
		};
	}, [socket1, socket2, slug]);

	if (!provider1 || !provider2) {
		return <></>;
	}

	provider1.attach();
	provider2.attach();

	return (
		<div className="flex flex-col min-h-screen">
			<header className="border-b border-white/8">
				<div className="px-10 py-6 flex items-center justify-between">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-xl font-semibold tracking-tight text-white">
								Article #{slug}
							</h1>
							<span className="text-[10px] font-medium uppercase tracking-[0.08em] px-1.5 py-0.5 rounded text-white/55 bg-white/5 border border-white/8">
								Classic Provider
							</span>
						</div>
						<p className="text-[12px] text-white/45 mt-1.5">
							Two editors, independent WebSockets, sharing one document
						</p>
					</div>
				</div>
			</header>

			<main className="flex-1 px-10 py-8">
				<div className="max-w-7xl mx-auto space-y-5">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h2 className="text-[13px] font-medium text-white">Editor 1</h2>
								<span className="text-[11px] text-white/45">
									Independent WebSocket
								</span>
							</div>
							<CollaborationStatus provider={provider1} />
							<div className="rounded-lg border border-white/8 bg-white/2">
								<CollaborativeEditor slug={slug} provider={provider1} />
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h2 className="text-[13px] font-medium text-white">Editor 2</h2>
								<span className="text-[11px] text-white/45">
									Independent WebSocket
								</span>
							</div>
							<CollaborationStatus provider={provider2} />
							<div className="rounded-lg border border-white/8 bg-white/2">
								<CollaborativeEditor slug={slug} provider={provider2} />
							</div>
						</div>
					</div>

					<div className="rounded-lg border border-white/8 bg-white/2 p-4">
						<p className="text-[12px] text-white/55 leading-relaxed">
							Both editors connect to the same document via separate WebSocket
							connections. Edits made in one editor appear in the other in
							real-time. Use the controls to test detach/reattach and
							disconnect/reconnect behavior.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
