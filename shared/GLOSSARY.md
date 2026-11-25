# Glossary

The words used in the code, the UI and the report mean exactly this.

| Term | Meaning |
|---|---|
| **Room** | A group of 3–8 players identified by a 4-character **code**. Public rooms appear in the browser; private rooms are joined by code only. |
| **Host** | The player who created the room (or the oldest remaining player after the host leaves). Only the host changes settings and starts the game. |
| **Profile** | A player's nickname and avatar colour, saved on their phone. |
| **Mode** | `draw-guess` (Draw & Guess) or `draw-pass` (Draw & Pass). |
| **Round** (Draw & Guess) | One drawer draws one secret word while the others guess. A game has `rounds × players` turns of drawing. |
| **Secret word** | The word being drawn. Only the server and the drawer ever know it. |
| **Mask** | The secret word with hidden letters shown as `_` (spaces and hyphens stay visible), e.g. `r _ _ _ _ t`. |
| **Hint** | A letter of the mask revealed while the round runs (at 50 % and 75 % of the time). |
| **Guess verdict** | `correct`, `close` (a near-miss: small typo, see `matchGuess`) or `wrong`. |
| **Chain** (Draw & Pass) | The sequence started by one player: sentence → drawing → sentence → … each made by a different player. |
| **Step** (Draw & Pass) | One turn where every player adds one entry to the chain they are holding, then passes it on. |
| **Reveal** | End of a Draw & Pass game: each chain is shown entry by entry. |
| **Stroke** | One continuous line drawn on the canvas: colour, brush size and normalized points. |
| **Game result** | The saved summary of a finished game (scores and, for Draw & Pass, chains) kept in the phone's history. |
