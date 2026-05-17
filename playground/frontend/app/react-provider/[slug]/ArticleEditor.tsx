"use client";

import {
	CollabApiProviderWebsocketComponent,
	CollabApiRoom,
} from "@collab-api/provider-react";
import React, { useCallback } from "react";
import CollaborationStatus from "./CollaborationStatus";
import CollaborativeEditor from "./CollaborativeEditor";
import ConnectedUsers from "./ConnectedUsers";

export default function ArticleEditor({ slug }: { slug: string }) {
	const handleAuthFailed = useCallback(
		(data: { reason: string }) => {
			console.error(`[Editor 1] Auth failed for "${slug}":`, data.reason);
		},
		[slug],
	);

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
								React Provider
							</span>
						</div>
						<p className="text-[12px] text-white/45 mt-1.5">
							Two editors sharing a document via{" "}
							<code className="text-white/70 font-mono">@collab-api/provider-react</code>
						</p>
					</div>
				</div>
			</header>

			<main className="flex-1 px-10 py-8">
				<div className="max-w-7xl mx-auto space-y-5">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
						<CollabApiProviderWebsocketComponent url={process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080"}>
							<CollabApiRoom
								name={slug}
								onAuthenticationFailed={handleAuthFailed}
								onClose={(data) =>
									console.log("[Editor 1] Connection closed:", data.event)
								}
								onSynced={(data) =>
									console.log("[Editor 1] Synced:", data.state)
								}
							>
								<EditorPanel label="Editor 1" subtitle="Event handlers via props" />
							</CollabApiRoom>
						</CollabApiProviderWebsocketComponent>

						<CollabApiProviderWebsocketComponent url={process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080"}>
							<CollabApiRoom name={slug}>
								<EditorPanel label="Editor 2" subtitle="Event handlers via hook" />
							</CollabApiRoom>
						</CollabApiProviderWebsocketComponent>
					</div>

					<div className="rounded-lg border border-white/8 bg-white/2 p-4">
						<p className="text-[12px] text-white/55 leading-relaxed">
							Each editor wraps in{" "}
							<code className="text-white/85 font-mono text-[11px]">
								CollabApiProviderWebsocketComponent
							</code>{" "}
							(independent WebSocket) and{" "}
							<code className="text-white/85 font-mono text-[11px]">
								CollabApiRoom
							</code>
							. State is read via{" "}
							<code className="text-white/85 font-mono text-[11px]">
								useCollabApi*()
							</code>{" "}
							hooks. Open the same slug in a second tab to see edits sync.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}

function EditorPanel({ label, subtitle }: { label: string; subtitle: string }) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="text-[13px] font-medium text-white">{label}</h2>
				<span className="text-[11px] text-white/45">{subtitle}</span>
			</div>

			<CollaborationStatus />
			<ConnectedUsers />

			<div className="rounded-lg border border-white/8 bg-white/2">
				<CollaborativeEditor />
			</div>
		</div>
	);
}
