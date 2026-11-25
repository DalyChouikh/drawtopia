# DrawTopia — jeu de dessin multijoueur

Application mobile multijoueur (3 à 8 joueurs) autour du dessin et de l'imagination, réalisée avec
**React Native (Expo)** et un **serveur Node.js temps réel (Socket.IO)**.

- **Draw & Guess** : un joueur dessine un mot secret, les autres le devinent ; une faute de frappe proche du mot
  est signalée « close » (« presque ! »).
- **Draw & Pass** : chacun écrit une phrase, dessine la phrase reçue, décrit le dessin reçu… puis les chaînes
  sont révélées.
- Salons **publics ou privés** (code de 4 caractères), pseudonyme, scores, historique des parties hors ligne.

L'interface de l'application est en anglais ; ce document et le rapport sont en français.

## Présentation

| | |
|---|---|
| Public | Amis qui veulent jouer ensemble, à distance ou dans la même pièce |
| Besoin | Réunir jeu de dessin-devinette et jeu de « téléphone dessiné » dans une seule application simple |
| Type d'application | Hybride-native : React Native (TypeScript) exécuté par Expo Go, + serveur Node.js |
| Les 4 actions | 1. Créer un salon public/privé ou en rejoindre un · 2. Choisir le mode et la durée des tours · 3. Dessiner, deviner ou écrire · 4. Consulter les scores / la révélation des chaînes / l'historique |

## Environnement

| Élément | Version testée |
|---|---|
| Système | Windows 11 (fonctionne aussi sous macOS/Linux) |
| Node.js | 24.21 (≥ 20 requis) · npm 11.19 |
| Expo SDK | 58 (`expo` 58.0.26, React Native 0.88.1) |
| Appareil de test | Émulateur Android 16 (API 36, AVD `University_API_36`) avec **Expo Go 58.0.6** |
| Serveur en ligne | https://drawtopia-server-wbk7.onrender.com (Render, offre gratuite) |

Aucun compte, clé secrète ni base de données n'est nécessaire : le serveur garde les salons en mémoire,
et l'application enregistre le profil et l'historique sur le téléphone (AsyncStorage).

## Installation (depuis le dossier ZIP extrait)

```bash
cd projet
npm install          # installe les 3 espaces de travail : app/, server/, shared/
npm test             # 84 tests automatiques (Vitest) — tous doivent passer
```

## Lancement

**1. Le serveur de jeu** (dans un premier terminal) :

```bash
npm run server       # → DrawTopia server listening on http://localhost:3001
```

Vérification : ouvrir http://localhost:3001/health → `{"ok":true,"rooms":0}`.
Variante sans serveur local : utiliser le serveur en ligne (voir « Choisir le serveur » ci-dessous).

**2. L'application** (dans un second terminal) :

```bash
npm run app          # démarre Metro (Expo) et affiche un QR code
```

- **Émulateur Android** : appuyer sur `a` dans le terminal Metro (Expo Go s'installe sur l'émulateur).
- **Téléphone Android** : installer Expo Go (Play Store), être sur le **même Wi-Fi** que le PC, scanner le QR code
  depuis Expo Go.
- **iPhone** : voir `docs/PHONES.md` (Expo Go sur iOS demande un compte Expo et, selon la documentation Expo
  actuelle, un abonnement Apple Developer).

Si le téléphone ne se connecte pas (Wi-Fi public, pare-feu Windows), autoriser Node.js sur le réseau privé ou
lancer Metro en mode tunnel : `npm i -g @expo/ngrok` puis `npx expo start --tunnel` dans `app/`.

### Choisir le serveur

Dans l'application : **Settings → Game server** :
- **This computer** : le serveur lancé par `npm run server` sur le PC qui exécute Metro (par défaut en développement) ;
- **Online server** : le serveur déployé sur Render (fonctionne en 4G / sur n'importe quel réseau).
  Il s'endort après 15 min sans joueurs et met environ **1 minute** à se réveiller : ouvrir
  https://drawtopia-server-wbk7.onrender.com/health avant la démonstration.

## Jeu de test (reproduire les 4 actions et les cas négatifs)

Il faut **3 joueurs** pour lancer une partie : 3 appareils (émulateur + 2 téléphones), ou un appareil + des
joueurs simulés. Données de démonstration : pseudonymes `Daly`, `Nova`, `Mia` ; mot d'exemple « desert ».

| Action | Parcours |
|---|---|
| 1. Créer / rejoindre | Home → toucher la carte du pseudo → saisir `Daly` → Save. **Create room** → Create room : le lobby affiche un code (ex. `RXX8`). Sur un autre appareil : **Join with code** → saisir le code. |
| 2. Mode et durée | Dans **Create room** (ou dans le lobby, pour l'hôte) : choisir *Draw & Guess* ou *Draw & Pass*, 30/60/90 s, 1 à 5 tours. |
| 3. Dessiner / deviner / écrire | Hôte : **Start game**. Le dessinateur choisit un mot et dessine ; les autres tapent leurs propositions (une faute, ex. `dessert` pour `desert`, affiche « is close! »). En Draw & Pass : écrire → dessiner → décrire. |
| 4. Résultats / historique | Podium (Draw & Guess) ou révélation des chaînes (Draw & Pass), puis **Home → History** : la partie y est, même serveur coupé. |

| Cas négatif | Résultat attendu |
|---|---|
| Profil : Save avec un pseudo vide | Champ rouge « At least 2 characters », rien n'est enregistré |
| Join : code `ZZZZ` | « No room with code ZZZZ » |
| Lobby avec 2 joueurs | Bouton grisé « Need 1 more player » (le serveur refuse aussi : `NOT_ENOUGH_PLAYERS`) |
| Même pseudo qu'un joueur du salon | Refus « That nickname is taken in this room » |
| Serveur arrêté | Bandeau rouge « Offline: game server unreachable », l'historique reste consultable |

Le détail des 6 tests documentés (T1–T6) est dans `docs/tests.md`.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm test` | Tests unitaires et d'intégration (shared + server) |
| `npm run typecheck` | Vérification TypeScript des 3 espaces de travail |
| `npm run lint` | ESLint |
| `npm run check` | Les trois à la suite |

## Organisation du code

| Dossier | Contenu |
|---|---|
| `app/src/app/` | Écrans (expo-router) : accueil, profil, réglages, création, rejoindre, salons publics, lobby, jeu, historique |
| `app/src/features/` | Dessin (Skia), plateaux de jeu, salons, historique |
| `app/src/components/ui/` | Système de design (boutons à ombre dure, cartes, champs…) |
| `app/src/stores/` | État (zustand) : profil, réglages, session, historique — persistés ; jeu, toasts — en mémoire |
| `app/src/services/` | Client Socket.IO typé, appels serveur, vibrations |
| `server/src/` | Serveur : salons (`RoomManager`), moteurs de jeu (`DrawGuessGame`, `DrawPassGame`), sockets |
| `shared/src/` | Modèle de données, protocole, validations (zod), règles du jeu, algorithme « close » |
| `docs/` | Tickets, tests, déploiement, guide téléphones |

## Limites connues

- **Serveur indisponible** : l'application affiche un bandeau hors ligne et refuse les actions en ligne avec un
  message ; profil et historique restent utilisables. Les salons sont en mémoire : un redémarrage du serveur les
  supprime (l'application l'indique : « Your last room is closed. »).
- **Mode avion en développement** : Expo Go charge le code de l'application depuis Metro ; sans réseau il ne peut
  pas démarrer. Le test hors ligne se fait donc en coupant le **serveur de jeu** (l'historique reste lisible).
- Le dessin est transmis trait par trait (à la fin de chaque trait), pas point par point.
- Aucune permission sensible (caméra, localisation…) n'est demandée.
- Serveur gratuit : mise en veille après 15 min d'inactivité (≈ 1 min de réveil).
