import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "antd";

import WebSocketEventManager from "../../networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";
import { getWikiTitle } from "../../networking/util";
import PathForm from "./PathForm";
import WikiLink from "./WikiLink";
import Player from "../../models/player";
import { TimeLeaderboard, ScoreLeaderboard } from "./Leaderboards";

type RoundProps = {
  wsem: WebSocketEventManager,
  players: Array<Player>
}

const Round = ({ wsem, players }: RoundProps) => {
  const [source, setSource] = useState({ path: "", title: "", error: false });
  const [dest, setDest] = useState({ path: "", title: "", error: false });
  const [roundStarted, setRoundStarted] = useState(false);
  const [finishedPlayers, setFinishedPlayers] = useState<Array<Player>>([]);

  useEffect(() => {
    wsem.addEventHandler(wsEvents.s_roundInfo, (data) => {
      setSource((old) => ({ ...old, path: data.sourcePath === null ? "" : data.sourcePath }));
      setDest((old) => ({ ...old, path: data.destPath === null ? "" : data.destPath }));
    });

    wsem.addEventHandler(wsEvents.s_roundStarted, () => setRoundStarted(true));

    wsem.addEventHandler(wsEvents.s_finishUpdate, (data) => {
      data.updates.forEach((update: any) => {
        const player = players.find(update.id);
        if(player) {
          player.time = update.time;
          if(finishedPlayers.includes(player)) setFinishedPlayers((old) => [...old]);
          else setFinishedPlayers((old) => [...old, player]);
        }
      });
    });

    return () => {
      wsem.removeEventHandler(wsEvents.s_roundInfo);
      wsem.removeEventHandler(wsEvents.s_roundStarted);
      wsem.removeEventHandler(wsEvents.s_finishUpdate);
    };
  }, [wsem, players, finishedPlayers]);

  useEffect(() => {
    if(source.path !== "") {
      const getTitle = async () => {
        const title = await getWikiTitle(source.path);
        setSource((source) => ({ ...source, title, error: false }));
      }
  
      getTitle().catch(() => setSource((source) => ({ ...source, error: true })));
    }
  }, [source.path, wsem]);

  useEffect(() => {
    if(dest.path !== "") {
      const getTitle = async () => {
        const title = await getWikiTitle(dest.path);
        setDest((dest) => ({ ...dest, title, error: false }));
      }
  
      getTitle().catch(() => setDest((dest) => ({ ...dest, error: true })));
    }
  }, [dest.path, wsem]);

  const body = roundStarted
    ? (
      <>
        <Row style={{ justifyContent: "center" }}>
          <Button type="primary" size="large" >Article found</Button>
        </Row>
        <Row>
          <TimeLeaderboard playerCount={players.length} finishedPlayers={finishedPlayers} />
        </Row>
      </>
    )
    : (
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <PathForm typeText="Start" onSubmit={(path) => {
            setSource({ ...source, path });
            wsem.sendMessage(wsEvents.c_setSource, { path });
          }} />
        </Col>
        <Col span={12}>
          <PathForm typeText="End" onSubmit={(path) => {
            setDest({ ...dest, path });
            wsem.sendMessage(wsEvents.c_setDest, { path });
          }} />
        </Col>
      </Row>
    );

  return (
    <div>
      {
        !roundStarted
          ? <Row style={{margin: "2rem 0", justifyContent: "center"}}>
              <Button type="primary" size="large">Start round</Button>
            </Row>
          : null
      }
      <Row gutter={[16, 16]} style={{ textAlign: "left", fontSize: "x-large" }}>
        <Col span={12}>
          <WikiLink labelTitle="Start" {...source} />
        </Col>
        <Col span={12}>
          <WikiLink labelTitle="End" {...dest} />
        </Col>
      </Row>
      {body}
    </div>
  );
};

export default Round;
