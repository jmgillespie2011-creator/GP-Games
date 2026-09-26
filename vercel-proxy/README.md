# last-partner-standing.vercel.app

The Vercel project `last-partner-standing` holds only `last-partner-standing/vercel.json`, which proxies every request to https://gp-games.vercel.app. The address stays last-partner-standing.vercel.app, and it always serves whatever `gp-games` is serving, so a push to `main` updates both.

Only redeploy it if this file changes, as a production deployment of `vercel-proxy/last-partner-standing` to the project `last-partner-standing`.
