// View event definitions in the server's README
const wsEvents = {
  c_join:         "c_join",
  s_init:         "s_init",
  c_reconnect:    "c_reconnect",
  s_lobbyUpdate:  "s_lobbyUpdate",
  c_startMatch:   "c_startMatch",
  s_players:      "s_players",
  s_roundInfo:    "s_roundInfo",
  c_setSource:    "c_setSource",
  c_setDest:      "c_setDest",
  c_startRound:   "c_startRound",
  s_roundStarted: "s_roundStarted",
  c_articleFound: "c_articleFound",
  s_finishUpdate: "s_finishUpdate",
  s_leaderboard:  "s_leaderboard",
  c_endMatch:     "c_endMatch",
  s_results:      "s_results",
  s_error:        "s_error"
};

export default wsEvents;
