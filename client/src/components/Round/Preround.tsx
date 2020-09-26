import React from "react";
import { Row, Col, Button } from "antd";
import { wsEvents } from "wikirace-shared";

import WikiLink from "./WikiLink";
import WebSocketEventManager from "../../networking/websocketEventManager";
import PathForm from "./PathForm";
import { WikiData } from "./types";

type PreroundProps = {
  wsem: WebSocketEventManager,
  source: WikiData,
  dest: WikiData,
  onNewSource: (path: string) => void,
  onNewDest: (path: string) => void
}

const Preround = ({ wsem, source, dest, onNewSource, onNewDest }: PreroundProps) => {
  return (
    <div>
      <Row style={{margin: "2rem 0", justifyContent: "center"}}>
        <Button type="primary" size="large" onClick={() => wsem.sendMessage(wsEvents.c_startRound, null)}>Start round</Button>
      </Row>
      <Row gutter={[16, 16]} style={{ textAlign: "left", fontSize: "x-large" }}>
        <Col span={12}>
          <WikiLink labelTitle="Start" {...source} />
        </Col>
        <Col span={12}>
          <WikiLink labelTitle="End" {...dest} />
        </Col>
      </Row>
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <PathForm typeText="Start" onSubmit={(path) => {
            onNewSource(path);
            wsem.sendMessage(wsEvents.c_setSource, { path });
          }} />
        </Col>
        <Col span={12}>
          <PathForm typeText="End" onSubmit={(path) => {
            onNewDest(path);
            wsem.sendMessage(wsEvents.c_setDest, { path });
          }} />
        </Col>
      </Row>
    </div>
  );
};

export default Preround;
