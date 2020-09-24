import React, { useEffect } from "react";
import { Button } from "antd";
import { History } from "history";

import WebSocketEventManager from "../networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";
import Player from "../models/player";

type WaitingProps = {
  wsem: WebSocketEventManager,
  history: History,
  name: string,
  onPlayers: (players: Array<Player>) => void
}

const Waiting = ({ wsem, history, name, onPlayers }: WaitingProps) => {
  useEffect(() => {
    wsem.addEventHandler(wsEvents.s_players, (data: any) => {
      onPlayers(data.players.map((player: any) => new Player(player.id, player.name)));
      history.push("/round");
    });

    return () => {
      wsem.removeEventHandler(wsEvents.s_roundInfo);
    };
  }, [wsem, history, onPlayers]);

  return (
    <div>
      <h2>Welcome, {name}!</h2>
      <Button type="primary" onClick={() => wsem.sendMessage(wsEvents.c_startMatch, null)}>Start match</Button>
    </div>
  );
};

export default Waiting;
