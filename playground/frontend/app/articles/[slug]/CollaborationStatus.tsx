import type {
	CollabApiProvider,
	onStatusParameters,
	onUnsyncedChangesParameters,
} from "@collab-api/provider";
import { useEffect, useState } from "react";

const UNSYNCED_THRESHOLD = 10;

const CollaborationStatus = (props: { provider: CollabApiProvider }) => {
	const { provider } = props;

	const [unsyncedChanges, setUnsyncedChanges] = useState(0);
	const [socketStatus, setSocketStatus] = useState<string | null>(null);
	const [isAttached, _setAttached] = useState<boolean>(false);

	useEffect(() => {
		setSocketStatus(provider.configuration.websocketProvider.status);
		_setAttached(provider.isAttached);

		const handleUnsyncedChanges = (changes: onUnsyncedChangesParameters) => {
			setUnsyncedChanges(changes.number);
		};

		const handleSocketStatus = (status: onStatusParameters) => {
			setSocketStatus(status.status);
		};

		provider.on("unsyncedChanges", handleUnsyncedChanges);
		provider.configuration.websocketProvider.on("status", handleSocketStatus);

		return () => {
			provider.off("unsyncedChanges", handleUnsyncedChanges);
			provider.configuration.websocketProvider.off(
				"status",
				handleSocketStatus,
			);
		};
	}, [provider]);

	const updateAttached = (attach: boolean) => {
		if (attach) {
			provider.attach();
		} else {
			provider.detach();
		}
		_setAttached(provider.isAttached);
	};

	const isOverThreshold = unsyncedChanges >= UNSYNCED_THRESHOLD;

	return (
		<div className="rounded-lg border border-white/8 bg-white/2">
			{isOverThreshold && (
				<div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2.5">
					<Dot tone="red" pulse />
					<div>
						<p className="text-[12px] font-medium text-red-400">
							Connection issue detected
						</p>
						<p className="text-[11px] text-white/45">
							{unsyncedChanges} changes waiting. Edits are saved locally but
							not on the server.
						</p>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
				<span className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/45">
					Status
				</span>
				<div className="flex items-center gap-1.5">
					<StatusPill
						value={socketStatus || "unknown"}
						tone={
							socketStatus === "connected"
								? "green"
								: socketStatus === "connecting"
									? "amber"
									: "red"
						}
					/>
					<StatusPill
						value={isAttached ? "attached" : "detached"}
						tone={isAttached ? "green" : "red"}
					/>
					<StatusPill
						value={`${unsyncedChanges} unsynced`}
						tone={isOverThreshold ? "red" : unsyncedChanges > 0 ? "amber" : "neutral"}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-px bg-white/8">
				<div className="bg-black p-4">
					<div className="text-[10px] font-medium uppercase tracking-[0.06em] text-white/45 mb-2.5">
						Socket
					</div>
					<div className="flex gap-2">
						<Button
							variant="danger"
							onClick={() =>
								provider.configuration.websocketProvider.disconnect()
							}
							disabled={socketStatus === "disconnected"}
						>
							Disconnect
						</Button>
						<Button
							variant="primary"
							onClick={() => provider.configuration.websocketProvider.connect()}
							disabled={socketStatus === "connected"}
						>
							Connect
						</Button>
					</div>
				</div>

				<div className="bg-black p-4">
					<div className="text-[10px] font-medium uppercase tracking-[0.06em] text-white/45 mb-2.5">
						Provider
					</div>
					<div className="flex gap-2">
						<Button
							variant="warning"
							onClick={() => updateAttached(false)}
							disabled={!isAttached}
						>
							Detach
						</Button>
						<Button
							variant="primary"
							onClick={() => updateAttached(true)}
							disabled={isAttached}
						>
							Attach
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

type Tone = "green" | "amber" | "red" | "neutral";

function toneClasses(tone: Tone) {
	switch (tone) {
		case "green":
			return { dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-400/8" };
		case "amber":
			return { dot: "bg-amber-400", text: "text-amber-300", bg: "bg-amber-400/8" };
		case "red":
			return { dot: "bg-red-400", text: "text-red-300", bg: "bg-red-400/8" };
		default:
			return { dot: "bg-white/30", text: "text-white/55", bg: "bg-white/5" };
	}
}

function Dot({ tone, pulse = false }: { tone: Tone; pulse?: boolean }) {
	const t = toneClasses(tone);
	return (
		<span className="relative inline-flex w-1.5 h-1.5">
			{pulse && (
				<span
					className={`absolute inline-flex w-full h-full rounded-full ${t.dot} opacity-60 animate-ping`}
				/>
			)}
			<span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${t.dot}`} />
		</span>
	);
}

function StatusPill({ value, tone }: { value: string; tone: Tone }) {
	const t = toneClasses(tone);
	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium ${t.bg} ${t.text}`}
		>
			<Dot tone={tone} pulse={tone === "amber"} />
			{value}
		</span>
	);
}

function Button({
	children,
	onClick,
	disabled,
	variant,
}: {
	children: React.ReactNode;
	onClick: () => void;
	disabled?: boolean;
	variant: "primary" | "danger" | "warning";
}) {
	const base =
		"flex-1 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
	const variants = {
		primary: "bg-white text-black hover:bg-white/90 disabled:hover:bg-white",
		danger:
			"bg-red-400/10 text-red-300 border border-red-400/20 hover:bg-red-400/15 disabled:hover:bg-red-400/10",
		warning:
			"bg-amber-400/10 text-amber-300 border border-amber-400/20 hover:bg-amber-400/15 disabled:hover:bg-amber-400/10",
	} as const;
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`${base} ${variants[variant]}`}
		>
			{children}
		</button>
	);
}

export default CollaborationStatus;
