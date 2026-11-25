# Playing DrawTopia on real phones (Android + iPhone)

A game needs **at least 3 players**, so you need 3 phones (or 2 phones + the emulator).

Two separate things must reach each phone:

1. **The app code** — served by Metro (`npm run app`) on your PC, opened in **Expo Go**, or installed as an APK.
2. **The game server** — either your PC (`npm run server`) or the online server
   **https://drawtopia-server-wbk7.onrender.com** (works from any network, including 4G).

> The online server sleeps after 15 minutes without players. Open
> https://drawtopia-server-wbk7.onrender.com/health in a browser and wait for `{"ok":true,...}` (about a minute)
> before you start playing.

---

## 1. Everyone in the same room, same Wi-Fi (quickest)

On the PC:

```bash
npm run app        # Metro + QR code
```

You don't need `npm run server` if the phones use the online server (step 4 below).

### Android phones

1. Install **Expo Go** from the Play Store. It must support **SDK 58** (the project's SDK).
2. Connect the phone to the **same Wi-Fi** as the PC.
3. Open Expo Go → **Scan QR code** → scan the QR code shown in the Metro terminal.

### iPhone

Expo's current documentation says two things about iOS:

- Expo Go opens a development project only when the PC and Expo Go are **signed in to the same Expo account**:
  on the PC run `npx expo login` (free account at https://expo.dev/signup), and sign in to Expo Go with the same
  account (account icon, top right).
- Installing Expo Go on iOS requires an **Apple Developer Program** subscription; it is installed through
  TestFlight with `npx eas-cli@latest go`.

If the App Store on your iPhone does offer an Expo Go that supports SDK 58, use it; otherwise follow the TestFlight
route above. Without either, the iPhone can't run this development build (a standalone iOS build also needs the
Apple Developer Program).

### 4. Pick the server in the app (every phone)

**Settings → Game server → Online server → Test → Save.**
"Server reachable" must appear. All players must use **the same server**, or they won't see each other's rooms.

(Alternative: **This computer** + `npm run server` on the PC. If phones can't reach it, allow Node.js through the
Windows Firewall on private networks.)

### If a phone can't load the app

Public or university Wi-Fi often blocks phone-to-PC traffic. Use tunnel mode (slower reloads, but works anywhere):

```bash
npm i -g @expo/ngrok
cd app
npx expo start --tunnel
```

---

## 2. Friends at home, on other networks

- **Game server**: already handled — everyone picks **Online server**.
- **App code**, two options:
  - **Tunnel** (your PC must stay on): run `npx expo start --tunnel` in `app/` and send your friends a screenshot of
    the QR code. Each friend needs Expo Go (see the iPhone notes above).
  - **Android APK** (no PC needed afterwards): build once with EAS (free Expo account), then share the download
    link.

    ```bash
    cd app
    npx eas-cli@latest login
    npx eas-cli@latest build -p android --profile preview
    ```

    `app/eas.json` already contains the `preview` profile (`"buildType": "apk"`). The first build links the project
    to your Expo account. When it finishes, the build page gives a download link/QR code; friends install the APK
    (Android will ask to allow installing apps from that source). A standalone build uses the **online server** by
    default.

---

## 3. What to test together (10 minutes)

| # | Who | Do | Check |
|---|---|---|---|
| 1 | Everyone | Set a nickname and colour | It's still there after closing and reopening the app |
| 2 | Host | Create a **private** room, read the code aloud | Others join with **Join with code**; everyone appears in the lobby live |
| 3 | Host | Try **Start** with 2 players | Button says "Need 1 more player" |
| 4 | A friend | Join with the host's nickname | "That nickname is taken in this room" |
| 5 | All | Play **Draw & Guess** (60 s, 1 round) | Drawing appears on the other phones; a typo shows "… is close!"; correct guesses score; podium at the end |
| 6 | All | Back to lobby → host switches to **Draw & Pass** → Start | Write → draw → describe; chains revealed at the end |
| 7 | Anyone | **Home → History** | Both games are listed; open one; delete one |
| 8 | Anyone | Turn Wi-Fi off for 10 s during a game, then on | Red "Offline" banner, then the player is back in the game |
| 9 | Anyone | Create a **public** room | Others see it in **Browse public rooms** |

Take screenshots on the phones (they're good material for `captures/` and the demo), and note anything odd:
which phone, what you did, what you expected, what happened.
