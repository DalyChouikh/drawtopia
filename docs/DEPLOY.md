# Deploying the game server (Render, free plan)

The app works on a local network without any deployment (see README). Deploying the server lets phones play
from anywhere (mobile data, a university Wi-Fi that blocks device-to-device traffic).

## Live server

- URL: **https://drawtopia-server-wbk7.onrender.com** (health: `/health`)
- Deployed on 25/11/2026 from `render.yaml` with the Render plugin (Blueprint `drawtopia`, region Frankfurt, free plan).
- Checked after deploy: 3 Socket.IO clients over `wss://` played a Draw & Guess turn (word hidden from guessers,
  stroke relayed in ~91 ms, close and correct guesses scored), and the Android app created a room on it.
- In the app: **Settings → Online server** (one tap), or it is the default in a standalone build
  (`app.json` → `extra.serverUrl`). In development the default stays the computer running Metro.

## What is already prepared

- `render.yaml` (Render Blueprint): one free web service in Frankfurt.
  - Build: `npm ci --workspace @drawtopia/server` — installs only the server and `shared/` (≈ 30 packages).
  - Start: `npm run start --workspace @drawtopia/server`.
  - Health check: `GET /health` → `{"ok":true,"rooms":0}`.
- The server listens on the `PORT` environment variable (Render's default is `10000`).

Both commands were tested on a clean copy of the repository (no `node_modules`).

## Steps (done by the account owner)

1. Sign in at https://dashboard.render.com (a GitHub login works).
2. **New → Blueprint**, pick the `DalyChouikh/drawtopia` repository, branch `main`.
3. Render reads `render.yaml` and shows the `drawtopia-server` service → **Apply**.
4. Wait for the first deploy, then open `https://<service-name>.onrender.com/health` — it must answer
   `{"ok":true,...}`.
5. In the app: **Settings → Game server** → paste `https://<service-name>.onrender.com` → **Test** → **Save**.

## Things to know

- Free services **sleep after 15 minutes without traffic** and take **about a minute** to wake up. Before a demo,
  open the `/health` URL once and wait for the answer.
- Every push to `main` redeploys the server (`autoDeployTrigger: commit`). Rooms in memory are lost on a redeploy.
- The free plan has 750 instance hours per month per workspace; a sleeping service uses none.
