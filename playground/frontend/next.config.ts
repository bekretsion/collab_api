import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ["yjs"],
	allowedDevOrigins: ["127.0.0.1", "localhost"],
	turbopack: {
		root: "../../",
		resolveAlias: {
			"@collab-api/provider": "../../packages/provider/src/index.ts",
			"@collab-api/common": "../../packages/common/src/index.ts",
			"@collab-api/transformer": "../../packages/transformer/src/index.ts",
			"@collab-api/provider-react":
				"../../packages/provider-react/src/index.ts",
		},
	},
	webpack: (config) => {
		return config;
	},
};

export default nextConfig;
