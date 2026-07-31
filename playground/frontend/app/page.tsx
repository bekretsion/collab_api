export default function Home() {
	return (
		<div className="flex flex-col min-h-screen">
			<header className="border-b border-white/8">
				<div className="px-10 py-8">
					<h1 className="text-2xl font-semibold tracking-tight text-white">
						Playground
					</h1>
					<p className="text-[13px] text-white/50 mt-1.5">
						Real-time collaborative editor demo
					</p>
				</div>
			</header>

			<div className="flex-1 px-10 py-10">
				<div className="max-w-3xl space-y-8">
					<section>
						<h2 className="text-[15px] font-medium text-white mb-2">
							Getting started
						</h2>
						<p className="text-[13px] text-white/55 leading-relaxed max-w-xl">
							Pick an article from the sidebar to open a collaborative editor.
							Open the same article in a second tab to see edits sync between
							sessions.
						</p>
					</section>

					<section className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<Card
							title="Classic Provider"
							description="Imperative API. Create CollabApiProviderWebsocket manually and share via React context."
							badge="/articles/1"
						/>
						<Card
							title="React Provider"
							description="Declarative components and hooks. Wrap with CollabApiRoom, read state via useCollabApi* hooks."
							badge="/react-provider/1"
						/>
					</section>

					<section>
						<h2 className="text-[15px] font-medium text-white mb-2">
							Endpoints
						</h2>
						<dl className="text-[13px] divide-y divide-white/6 border-y border-white/6">
							<Row label="Frontend" value="http://127.0.0.1:3000" />
							<Row label="WebSocket" value="ws://127.0.0.1:8080" />
							<Row label="HTTP" value="http://127.0.0.1:8080" />
						</dl>
					</section>
          <script src="https://api.innoscribe.no/api/widget/w.js?s=595b497d0e51af99f3fc9f3f22d27506" async></script>
				</div>
			</div>
		</div>
	);
}

function Card({
	title,
	description,
	badge,
}: {
	title: string;
	description: string;
	badge: string;
}) {
	return (
		<div className="rounded-lg border border-white/8 bg-white/2 p-5 hover:bg-white/4 transition-colors">
			<div className="flex items-center justify-between mb-2">
				<h3 className="text-[13px] font-medium text-white">{title}</h3>
				<code className="text-[10px] text-white/40 font-mono">{badge}</code>
			</div>
			<p className="text-[12px] text-white/50 leading-relaxed">{description}</p>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between py-2.5">
			<dt className="text-white/55">{label}</dt>
			<dd className="text-white/85 font-mono text-[12px]">{value}</dd>
		</div>
	);
}
