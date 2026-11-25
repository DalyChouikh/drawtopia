# DrawTopia

Multiplayer drawing party game for 3–8 players, built with React Native (Expo) and a Node.js Socket.IO server.

- **Draw & Guess**: one player draws a secret word, the others guess it.
- **Draw & Pass**: players alternate between writing a sentence and drawing the one they received.

> Work in progress — full setup, test data and limitations will be documented here.

## Repository layout

| Folder | Content |
|---|---|
| `app/` | Expo (expo-router) mobile client |
| `server/` | Real-time game server (Node.js + Socket.IO) |
| `shared/` | Game rules, types and algorithms used by both |
| `brand/` | Logo masters, exports and brand guide |
| `docs/` | Tickets and report material |

## Quick start (dev)

```bash
npm install
npm run server   # game server on http://localhost:3001
npm run app      # Expo dev server (open in Expo Go)
```
