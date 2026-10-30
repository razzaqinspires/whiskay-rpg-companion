# Stage 35 — Bot/RPG integration boundary

- Bot command XP is persisted in the bot leveling store and keyed by chat + user; it does not silently overwrite RPG economy or inventory.
- Chess rating/win/loss data is stored under the bot application database `chessStats`, separate from RPG combat progression.
- No changes to the 3D world renderer or RPG combat logic are asserted for this stage.
- Bot tests: Stage 35 regression suite validates XP, typo suggestions and chess integration contracts. Live WhatsApp interaction and Canvas rendering must be validated on the deployment target.
