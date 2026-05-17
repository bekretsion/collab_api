import Link from "next/link";
import "./globals.css";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-black text-white antialiased">
				<div className="flex min-h-screen">
					{/* Sidebar */}
					<aside className="w-60 shrink-0 border-r border-white/8 bg-black">
						<div className="px-5 py-6">
							<Link
								href="/"
								className="flex items-center gap-2.5 mb-10 group"
							>
								<div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
									<span className="text-black font-semibold text-[11px] tracking-tight">
										C
									</span>
								</div>
								<span className="text-[13px] font-medium tracking-tight text-white">
									Collab API
								</span>
							</Link>

							<nav className="space-y-7">
								<NavSection title="Classic Provider" basePath="/articles" />
								<NavSection title="React Provider" basePath="/react-provider" />
							</nav>
						</div>
					</aside>

					{/* Main content */}
					<main className="flex-1 min-w-0">{children}</main>
				</div>
			</body>
		</html>
	);
}

function NavSection({
	title,
	basePath,
}: {
	title: string;
	basePath: string;
}) {
	return (
		<div>
			<h2 className="text-[10px] font-medium text-white/40 uppercase tracking-[0.08em] mb-2 px-2">
				{title}
			</h2>
			<ul className="space-y-0.5">
				{[1, 2, 3, 4].map((num) => (
					<li key={num}>
						<Link
							href={`${basePath}/${num}`}
							className="flex items-center px-2 py-1.5 text-[13px] text-white/70 rounded-md hover:bg-white/4 hover:text-white transition-colors"
						>
							Article {num}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
