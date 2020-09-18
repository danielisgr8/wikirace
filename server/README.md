# WikiRace Server
Facilitates WebSocket messages and manages state for Wikirace.

## WebSocket events
All WebSocket messages, whether sent from server to client or vice-versa, are of the following form:
```json
{
  "event": "name",
  "data": {
    "prop1": "a",
    "prop2": 2
  }
}
```
I.e. they are JSON objects with properties `event` (string) and `data` (object).

| Event name     | Origin | Description                                                                                                             | Data properties                                                 |
|----------------|--------|-------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| c_join         | Client | Sent when joining the game.                                                                                             | `name: string`                                                  |
| s_init         | Server | Sent in response to `c_join` to identify the current game and client ID. Used to detect reconnects.                     | `clientId: number, sessionId: string`                           |
| c_reconnect    | Client | Sent if a client suspects they are rejoining the game after a page refresh.                                             | `clientId: number, sessionId: string`                           |
| c_startMatch   | Client | Signals that all players have joined and the match should start (need only be sent by a single client, like Jackbox).   | None                                                            |
| s_players      | Server | Provides a list of all players                                                                                          | `players: [{ id: number, name: string }]`                       |
| s_roundInfo    | Server | Provides info on the current round that is relevant before the round begins. A path will be null if not yet set.        | `sourcePath: string, destPath: string`                          |
| c_setSource    | Client | Sets source article (starting point).                                                                                   | `path: string`                                                  |
| c_setDest      | Client | Sets destination article.                                                                                               | `path: string`                                                  |
| c_startRound   | Client | Signals the current round should begin.                                                                                 | None                                                            |
| s_roundStarted | Server | Signals the current round has begun.                                                                                    | None                                                            |
| c_articleFound | Client | Signals the client has reached the destination article.                                                                 | None                                                            |
| s_finishUpdate | Server | Provides updates to players who have found the article within the round. Time is in seconds.                            | `updates: [{ position: number, id: number, time: number }]`     |
| s_leaderboard  | Server | Provides an overall leaderboard update for the match. In ascending rank (1, 2, 3, etc.). Sent at the end of each round. | `leaderboard: [{ id: number, points: number, change: number }]` |
| c_endMatch     | Client | Signals the current match should end.                                                                                   | None                                                            |
| s_results      | Server | Provides end-of-game results. Leaderboard is in ascending rank.                                                         | `leaderboard: [{ id: number, points: number }]`                 |
| s_error        | Server | Alerts the client that their last message caused an error.                                                              | `code: number, message: string`                                 |

If no data properties are specified, the `data` property SHOULD be ignored in a message. No guarantees are made about its contents. The property itself, however, MUST exist.

### Error codes
| Code | Description        |
|------|--------------------|
| 0    | Invalid session ID |

### Paths
Whenever paths are sent to/from the server, they MUST only contain the Wikipedia URL path after `/wiki/` (e.g. `"List_of_programming_languages"`).
