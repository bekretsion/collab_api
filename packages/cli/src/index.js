#!/usr/bin/env node

import { Logger } from "@collab-api/extension-logger";
import { S3 } from "@collab-api/extension-s3";
import { SQLite } from "@collab-api/extension-sqlite";
import { Webhook } from "@collab-api/extension-webhook";
import { Server } from "@collab-api/server";
import meow from "meow";

export const cli = meow(
	`
  Usage
    $ collabApi [options]

  Options
    --port=, -p     Set the port, defaults to 1234.
    --webhook=, -w  Configure a custom webhook.
    --sqlite=, -s   Store data in a SQLite database, defaults to :memory:.
    --s3            Store data in S3 or S3-compatible storage.
    --s3-bucket=    S3 bucket name (required when using --s3).
    --s3-region=    S3 region, defaults to us-east-1.
    --s3-prefix=    S3 key prefix for documents.
    --s3-endpoint=  S3 endpoint URL (for S3-compatible services like MinIO).
    --version       Show the current version number.

  Examples
    $ collabApi --port 8080
    $ collabApi --webhook http://localhost/webhooks/collab-api
    $ collabApi --sqlite
    $ collabApi --sqlite database/default.sqlite
    $ collabApi --s3 --s3-bucket my-docs
    $ collabApi --s3 --s3-bucket my-docs --s3-region eu-west-1
    $ collabApi --s3 --s3-bucket my-docs --s3-endpoint http://localhost:9000

  Environment Variables (for S3)
    AWS_ACCESS_KEY_ID       AWS access key ID
    AWS_SECRET_ACCESS_KEY   AWS secret access key
    AWS_REGION              AWS region (alternative to --s3-region)
`,
	{
		importMeta: import.meta,
		flags: {
			port: {
				type: "string",
				shortFlag: "p",
				default: "1234",
			},
			webhook: {
				type: "string",
				shortFlag: "w",
				default: "",
			},
			sqlite: {
				type: "string",
				shortFlag: "s",
				default: "",
			},
			s3: {
				type: "boolean",
				default: false,
			},
			s3Bucket: {
				type: "string",
				default: "",
			},
			s3Region: {
				type: "string",
				default: "us-east-1",
			},
			s3Prefix: {
				type: "string",
				default: "",
			},
			s3Endpoint: {
				type: "string",
				default: "",
			},
		},
	},
);

export const getConfiguredWebhookExtension = () => {
	return cli.flags.webhook
		? new Webhook({
				url: cli.flags.webhook,
			})
		: undefined;
};

export const getConfiguredSQLiteExtension = () => {
	if (cli.flags.sqlite) {
		return new SQLite({
			database: cli.flags.sqlite,
		});
	}
	if (process.argv.includes("--sqlite")) {
		return new SQLite();
	}

	return undefined;
};

export const getConfiguredS3Extension = () => {
	if (!cli.flags.s3) {
		return undefined;
	}

	const bucket = cli.flags.s3Bucket || process.env.S3_BUCKET;
	if (!bucket) {
		console.error(
			"❌ S3 bucket is required. Use --s3-bucket or set S3_BUCKET environment variable.",
		);
		process.exit(1);
	}

	const config = {
		bucket,
		region: cli.flags.s3Region || process.env.AWS_REGION || "us-east-1",
	};

	if (cli.flags.s3Prefix) {
		config.prefix = cli.flags.s3Prefix;
	}

	if (cli.flags.s3Endpoint) {
		config.endpoint = cli.flags.s3Endpoint;
		config.forcePathStyle = true;
	}

	if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
		config.credentials = {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		};
	}

	return new S3(config);
};

const server = new Server({
	port: Number.parseInt(cli.flags.port, 10),
	extensions: [
		new Logger(),
		getConfiguredWebhookExtension(),
		getConfiguredSQLiteExtension(),
		getConfiguredS3Extension(),
	].filter((extension) => extension),
});

server.listen();
