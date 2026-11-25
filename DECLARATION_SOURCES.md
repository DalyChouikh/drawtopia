# Déclaration des sources et des aides

## Aide automatisée (IA)

| Quoi | Où | Comment le résultat a été vérifié |
|---|---|---|
| **Claude Code** (assistant de programmation d'Anthropic, modèle Claude Opus 5.5) a été utilisé pendant tout le projet : choix techniques discutés sous forme de questions/options, découpage en tickets, écriture du code (app, serveur, règles partagées), des tests, de la documentation et du brouillon de ce rapport, conception du logo. | Tout le dépôt (`app/`, `server/`, `shared/`, `docs/`, `brand/`, `rapport.pdf`) | Chaque décision a été validée par l'étudiant (style visuel, règles du jeu, algorithme « close », langue de l'interface, déploiement). Le code est vérifié par `npm run check` (TypeScript strict, ESLint, 84 tests Vitest) et par GitHub Actions à chaque push ; chaque fonctionnalité a été exécutée sur l'émulateur Android (captures dans `captures/`) ; le serveur déployé a été testé par une partie réelle à 3 clients. L'étudiant doit pouvoir expliquer et modifier ce code pendant la soutenance. |

## Bibliothèques (déclarées dans les `package.json`)

| Bibliothèque | Usage |
|---|---|
| Expo SDK 58, React Native 0.88, React 19 | Application mobile |
| expo-router | Navigation par fichiers (écrans dans `app/src/app/`) |
| @shopify/react-native-skia | Dessin du canevas et du fond quadrillé |
| react-native-gesture-handler, react-native-reanimated, react-native-worklets | Geste de dessin sur le fil d'interface, animations |
| zustand + @react-native-async-storage/async-storage | État de l'application et persistance |
| expo-haptics, expo-clipboard, expo-font, expo-splash-screen, expo-status-bar | Vibrations, copie du code, polices, écran de lancement |
| socket.io / socket.io-client | Communication temps réel |
| zod | Validation des données reçues/envoyées |
| tsx | Exécution du serveur TypeScript |
| Vitest, ESLint, Prettier, TypeScript | Tests et qualité |

## Ressources

- **Polices** (Google Fonts, licence SIL Open Font License) via `@expo-google-fonts` : Permanent Marker,
  Patrick Hand, Space Grotesk.
- **Logo** : créé pour le projet (`brand/`), lettres du mot-symbole issues de la police Permanent Marker
  converties en tracés (`opentype.js`, script non inclus dans l'application).
- **Liste de mots** (`shared/src/words.ts`) : 240 mots anglais courants, écrits pour le projet.
- **Documentation consultée** : docs.expo.dev (SDK 58, expo-router, Reanimated, Skia, monorepos, splash
  screen, polices), docs de Socket.IO, render.com/docs (Blueprints, offre gratuite, WebSockets).

## Hébergement

- Serveur de jeu déployé sur **Render** (offre gratuite) : https://drawtopia-server-wbk7.onrender.com
- Code source : https://github.com/DalyChouikh/drawtopia

Aucun extrait de code n'a été copié depuis un autre projet.
