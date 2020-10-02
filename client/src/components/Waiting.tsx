import React, { useEffect } from "react";
import { Button } from "antd";
import { History } from "history";

import WebSocketEventManager from "../networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";
import Player from "../models/player";
import useStorageState from "../util/useStorageState";

type WaitingProps = {
  wsem: WebSocketEventManager,
  history: History,
  name: string,
  onPlayers: (players: Array<Player>) => void
}

const Waiting = ({ wsem, history, name, onPlayers }: WaitingProps) => {
  const [lobbyPlayers, setLobbyPlayers] = useStorageState<{ id: number, name: string }[]>("lobbyPlayers", []);

  useEffect(() => {
    wsem.addEventHandler(wsEvents.s_players, (data: any) => {
      onPlayers(data.players.map((player: any) => new Player(player.id, player.name)));
      history.push("/round");
    });

    wsem.addEventHandler(wsEvents.s_lobbyUpdate, (data: any) => {
      setLobbyPlayers((old) => [...old, ...data.players]);
    });

    return () => {
      wsem.removeEventHandler(wsEvents.s_roundInfo);
      wsem.removeEventHandler(wsEvents.s_lobbyUpdate);
    };
  }, [wsem, history, onPlayers, setLobbyPlayers]);

  return (
    <div>
      <h2>Welcome, {name}!</h2>
      <Button type="primary" onClick={() => wsem.sendMessage(wsEvents.c_startMatch, null)}>Start match</Button>
      <h2 style={{ marginTop: "1rem" }}>Players:</h2>
      <ul style={{ textAlign: "left", display: "inline-block", fontSize: "large" }}>
        {lobbyPlayers.map((player) => (<li key={player.id}>{player.name}</li>))}
      </ul>
    </div>
  );
};

export default Waiting;
