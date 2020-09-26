import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "antd";
import { wsEvents } from "wikirace-shared";

import WikiLink from "./Round/WikiLink";
import WebSocketEventManager from "../networking/websocketEventManager";
import { WikiData } from "./Round/types";
import Player from "../models/player";
import { TimeLeaderboard } from "./Round/Leaderboards";

type IntraroundProps = {
  wsem: WebSocketEventManager,
  source: WikiData,
  dest: WikiData,
  players: Array<Player>
};

const Intraround = ({ wsem, source, dest, players }: IntraroundProps) => {
  const [finishedPlayers, setFinishedPlayers] = useState<Array<Player>>([]);
  const [articleFound, setArticleFound] = useState(false);

  useEffect(() => {
    wsem.addEventHandler(wsEvents.s_finishUpdate, (data) => {
      data.updates.forEach((update: any) => {
        const player = players.find((player) => player.id === update.id);
        if(player) {
          player.time = update.time;
          setFinishedPlayers((old) => {
            if(old.includes(player)) return old;
            else return [...old, player]
          });
        }
      });
    });

    return () => {
      wsem.removeEventHandler(wsEvents.s_finishUpdate);
    };
  }, [wsem, players]);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ textAlign: "left", fontSize: "x-large" }}>
        <Col span={12}>
          <WikiLink labelTitle="Start" {...source} />
        </Col>
        <Col span={12}>
          <WikiLink labelTitle="End" {...dest} />
        </Col>
      </Row>
      <Row style={{ justifyContent: "center" }}>
        <Button type="primary" size="large" disabled={articleFound} onClick={() => {
          setArticleFound(true);
          wsem.sendMessage(wsEvents.c_articleFound, null);
        }}>Article found</Button>
      </Row>
      <Row>
        <TimeLeaderboard playerCount={players.length} finishedPlayers={finishedPlayers} />
      </Row>
    </div>
  );
};

export default Intraround;
