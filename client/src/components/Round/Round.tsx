import React, { useState, useEffect } from "react";

import WebSocketEventManager from "../../networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";
import { getWikiTitle } from "../../networking/util";
import Player from "../../models/player";
import { WikiData } from "./types";
import Preround from "./Preround";
import Intraround from "../Intraround";

type RoundProps = {
  wsem: WebSocketEventManager,
  players: Array<Player>
}

const Round = ({ wsem, players }: RoundProps) => {
  const [source, setSource] = useState<WikiData>({ path: "", title: "", error: false });
  const [dest, setDest] = useState<WikiData>({ path: "", title: "", error: false });
  const [roundStarted, setRoundStarted] = useState(false);
  const [roundEnded, setRoundEnded] = useState(false);

  useEffect(() => {
    wsem.addEventHandler(wsEvents.s_roundInfo, (data) => {
      setSource((old) => ({ ...old, path: data.sourcePath === null ? "" : data.sourcePath }));
      setDest((old) => ({ ...old, path: data.destPath === null ? "" : data.destPath }));
    });

    wsem.addEventHandler(wsEvents.s_roundStarted, () => setRoundStarted(true));

    return () => {
      wsem.removeEventHandler(wsEvents.s_roundInfo);
      wsem.removeEventHandler(wsEvents.s_roundStarted);
    };
  }, [wsem, players]);

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

  const onNewSource = (path: string) => setSource({ ...source, path });
  const onNewDest = (path: string) => setDest({ ...dest, path });

  return (
    !roundStarted
      ? <Preround wsem={wsem} source={source} dest={dest} onNewSource={onNewSource} onNewDest={onNewDest} />
      : <Intraround wsem={wsem} source={source} dest={dest} players={players} />
  );
};

export default Round;
