import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";

import WebSocketEventManager from "../../networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";
import { getWikiTitle } from "../../networking/util";
import PathForm from "./PathForm";
import WikiLink from "./WikiLink";

type RoundProps = {
  wsem: WebSocketEventManager
}

const Round = ({ wsem }: RoundProps) => {
  const [source, setSource] = useState({ path: "", title: "", error: false });
  const [dest, setDest] = useState({ path: "Pet", title: "", error: false });

  useEffect(() => {
    wsem.addEventHandler(wsEvents.s_roundInfo, (data) => {
      setSource(data.sourcePath === null ? "" : data.sourcePath);
      setDest(data.destPath === null ? "" : data.destPath);
    });
  }, [wsem]);

  useEffect(() => {
    if(source.path !== "") {
      const getTitle = async () => {
        const title = await getWikiTitle(source.path);
        setSource((source) => ({ ...source, title, error: false }));
      }
  
      getTitle().catch(() => setSource((source) => ({ ...source, error: true })));
    }
  }, [source.path]);

  useEffect(() => {
    if(dest.path !== "") {
      const getTitle = async () => {
        const title = await getWikiTitle(dest.path);
        setDest((dest) => ({ ...dest, title, error: false }));
      }
  
      getTitle().catch(() => setDest((dest) => ({ ...dest, error: true })));
    }
  }, [dest.path]);

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
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <PathForm typeText="Start" onSubmit={(path) => setSource({ ...source, path })} />
        </Col>
        <Col span={12}>
          <PathForm typeText="End" onSubmit={(path) => setDest({ ...dest, path })} />
        </Col>
      </Row>
    </div>
  );
};

export default Round;
