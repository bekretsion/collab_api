"use client";

import { useCollabApiAwareness } from "@collab-api/provider-react";
import { useEffect, useState } from "react";

const avatarColors = [
	"bg-emerald-400 text-emerald-950",
	"bg-amber-400 text-amber-950",
	"bg-sky-400 text-sky-950",
	"bg-rose-400 text-rose-950",
	"bg-violet-400 text-violet-950",
	"bg-fuchsia-400 text-fuchsia-950",
	"bg-cyan-400 text-cyan-950",
	"bg-lime-400 text-lime-950",
];

const ConnectedUsers = () => {
	const users = useCollabApiAwareness();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-white/8 bg-white/2">
			<span className="text-[10px] font-medium uppercase tracking-[0.06em] text-white/45">
				Users
			</span>
			{mounted && (
				<div className="flex items-center gap-2.5">
					<div className="flex -space-x-1.5">
						{users.length === 0 && (
							<span className="text-[11px] text-white/35">none</span>
						)}
						{users.map((user, i) => (
							<div
								key={user.clientId}
								className={`w-5 h-5 rounded-full ${avatarColors[i % avatarColors.length]} ring-2 ring-black flex items-center justify-center`}
								title={`Client ${user.clientId}`}
							>
								<span className="text-[9px] font-semibold">
									{String(user.clientId).slice(-2)}
								</span>
							</div>
						))}
					</div>
					<span className="text-[11px] text-white/55 tabular-nums">
						{users.length}
					</span>
				</div>
			)}
		</div>
	);
};

export default ConnectedUsers;
