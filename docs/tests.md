# Tests — DrawTopia

## Environnement

- Windows 11, Node.js 24.21, npm 11.19
- Émulateur Android 16 (API 36, AVD `University_API_36`), **Expo Go 58.0.6**, Expo SDK 58
- Serveur local (`npm run server`, port 3001) et serveur déployé (Render, Francfort)
- Joueurs supplémentaires simulés par un script Node.js (`socket.io-client`) qui rejoint le salon et joue
  (`Nova`, `Mia`) — la même API que l'application.
- Exécution : 25/11/2026.

## Six scénarios documentés

| N° | Action / données | Attendu | Observé | Statut |
|---|---|---|---|---|
| **T1** — Parcours A : profil + salon privé | Pseudo `Daly`, couleur turquoise → Save. Create room (Draw & Guess, 60 s, 2 tours) | Retour à l'accueil avec le pseudo ; lobby avec code de 4 caractères, badge HOST, Start désactivé (« Need 2 more players ») | Code `RXX8`, `Daly (you)` HOST, bouton « Need 2 more players » ; deux joueurs rejoignent et apparaissent en direct (« Players 3/8 ») | ✅ |
| **T2** — Parcours B : partie Draw & Guess | 3 joueurs, 30 s, 1 tour. Daly choisit `desert` et dessine ; Nova tape `dessert`, Mia tape `Desert` | `dessert` → « Nova is close! » pour tous, le mot tapé seulement pour Nova ; `Desert` → correct, points selon la vitesse ; podium final | Nova : verdict `close` ; Mia : `correct`, **+179** ; dessinateur **+125** (1 devineur sur 2) ; indice `_ _ f _` à mi-temps au tour suivant ; podium « Mia wins! » | ✅ |
| **T3** — Parcours C : partie Draw & Pass + historique | 3 joueurs, 30 s. Daly écrit « a dog on a skateboard », dessine la phrase reçue, décrit le dessin reçu | Chaque étape reçoit l'entrée du bon joueur ; révélation des 3 chaînes ; partie enregistrée dans History | Daly reçoit la phrase de Nova à dessiner, le dessin de Nova à décrire ; chaîne de Daly : texte → dessin de Mia → description de Nova ; partie listée dans History | ✅ |
| **T4** — Navigation / état / fermeture | Fermer l'application de force (`am force-stop`) puis la rouvrir ; puis arrêter le serveur et rouvrir | Profil conservé ; retour au salon proposé ; historique conservé et lisible serveur coupé | Pseudo et couleur conservés ; carte « Back to room 268E » après rechargement ; serveur coupé : bandeau « Offline », History liste les 2 parties, suppression confirmée persistée | ✅ |
| **T5** — Négatif 1 : champ vide / format | Profil : Save avec pseudo vide ; Join : code `ZZZZ` | Refus avec message visible, application stable | « At least 2 characters » (champ rouge, secousse) ; « No room with code ZZZZ » | ✅ |
| **T6** — Négatif 2 : doublon / indisponible | Rejoindre avec le pseudo `daly` déjà pris ; démarrer avec 2 joueurs ; serveur arrêté | Refus `NICKNAME_TAKEN` ; démarrage impossible ; bandeau hors ligne | `{"ok":false,"error":"NICKNAME_TAKEN"}` ; bouton « Need 1 more player » + `NOT_ENOUGH_PLAYERS` côté serveur ; « Offline: game server unreachable » | ✅ |

Captures correspondantes : `captures/01` à `13` (accueil, lobby, canevas, cas négatifs, partie, podium,
chaîne, historique hors ligne).

## Tests automatiques (Vitest)

`npm test` → **84 tests, tous passants** (50 dans `shared/`, 34 dans `server/`), exécutés aussi à chaque push
par GitHub Actions. Exemples :

| Fichier | Ce qui est vérifié |
|---|---|
| `shared/src/guess/matchGuess.test.ts` | normalisation, distance bornée (comparée à une implémentation de référence sur 2 000 paires aléatoires), seuils, verdicts ; cas négatifs `car`/`cat`, guess vide |
| `shared/src/rules/pass.test.ts` | rotation Draw & Pass pour 3 à 8 joueurs (chaque chaîne passe une fois par chaque joueur) |
| `shared/src/validation.test.ts` | pseudo, code de salon, durées, traits trop longs (refus) |
| `server/src/rooms/RoomManager.test.ts` | chaque code d'erreur (salon introuvable, plein, pseudo pris, pas l'hôte, < 3 joueurs), transfert d'hôte, reconnexion |
| `server/src/game/DrawGuessGame.test.ts` | mot caché aux devineurs, points, « close » privé, fin anticipée, mot auto-choisi, déconnexion du dessinateur |
| `server/src/game/DrawPassGame.test.ts` | rotation des chaînes, refus d'un dessin pendant une étape d'écriture, entrées manquantes complétées |
| `server/src/createGameServer.test.ts` | 3 vrais clients Socket.IO : création → rejoindre → démarrer → tour complet, payload invalide refusé sans crash |

## Bugs trouvés et corrigés pendant les tests

- Deux copies de React (19.3.0 / 19.3.1) dans le monorepo → `overrides` dans `package.json` racine.
- Copies en double de gesture-handler / reanimated / worklets → même correction.
- Le serveur (tsx) ne voyait pas les exports de `shared/` → `"type": "module"` dans `shared/package.json`.
- Tableau des scores étiré sur toute la hauteur (ScrollView horizontal) → `flexGrow: 0`.
- Fil des messages qui ne défilait pas jusqu'au dernier → `onContentSizeChange`.
- Le dessinateur ne voyait pas les notifications « close / guessed » → bandeau de la dernière notification.
- Toast qui débordait de l'écran pendant l'animation → animation remplacée.
- Contraste : texte blanc sur bleu (≈ 3,8:1) → texte encre (≈ 4,5:1).

## Limites des tests

- Tests réalisés sur émulateur Android avec des joueurs simulés ; les essais sur téléphones réels (Android et
  iPhone) sont décrits dans `docs/PHONES.md`.
- Le démarrage à froid en mode avion ne peut pas être montré avec Expo Go (le code de l'application vient de
  Metro par le réseau) ; le cas hors ligne est testé en coupant le serveur de jeu.
- L'animation de confettis (victoire / bonne réponse) n'a pas été observée à l'écran pendant ces sessions.
