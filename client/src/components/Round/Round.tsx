import React, { useState, useEffect } from "react";

import WebSocketEventManager from "../../networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";
import { getWikiTitle } from "../../networking/util";
import Player from "../../models/player";
import { WikiData } from "./types";
import Preround from "./Preround";
import Intraround from "./Intraround";
import Postround from "./Postround";

type RoundProps = {
  wsem: WebSocketEventManager,
  players: Array<Player>
}

const Round = ({ wsem, players }: RoundProps) => {
  const [source, setSource] = useState<WikiData>({ path: "", title: "", error: false });
  const [dest, setDest] = useState<WikiData>({ path: "", title: "", error: false });
  const [roundStarted, setRoundStarted] = useState(false);
  const [roundEnded, setRoundEnded] = useState(false);
  const [showPostround, setShowPostround] = useState(false);

  useEffect(() => {
    wsem.addEventHandler(wsEvents.s_roundInfo, (data) => {
      setSource((old) => ({ ...old, path: data.sourcePath === null ? "" : data.sourcePath }));
      setDest((old) => ({ ...old, path: data.destPath === null ? "" : data.destPath }));
    });

    wsem.addEventHandler(wsEvents.s_roundStarted, () => setRoundStarted(true));

    wsem.addEventHandler(wsEvents.s_leaderboard, (data) => {
      data.leaderboard.forEach((row: any) => {
        const player = players.find((player) => player.id === row.id);
        if(player) {
          player.score = row.points;
          player.change = row.change;
        }
      });
      setSource((old) => ({ ...old, oldPath: old.path, oldTitle: old.title }));
      setDest((old) => ({ ...old, oldPath: old.path, oldTitle: old.title }));
      setRoundEnded(true);
    });

    return () => {
      wsem.removeEventHandler(wsEvents.s_roundInfo);
      wsem.removeEventHandler(wsEvents.s_roundStarted);
      wsem.removeEventHandler(wsEvents.s_leaderboard);
    };
  }, [wsem, players]);

  const updateWikiDate = (path: string, update: React.Dispatch<React.SetStateAction<WikiData>>) => {
    if(path !== "") {
      const getTitle = async () => {
        const title = await getWikiTitle(path);
        update((old) => ({ ...old, title, error: false }));
      }
  
      getTitle().catch(() => update((old) => ({ ...old, error: true })));
    } else {
      update((old) => (old.title === "" ? old : { ...old, title: "", error: false }));
    }
  }

  useEffect(() => {
    updateWikiDate(source.path, setSource);
  }, [source.path]);

  useEffect(() => {
    updateWikiDate(dest.path, setDest);
  }, [dest.path]);

  const onNewSource = (path: string) => setSource({ ...source, path });
  const onNewDest = (path: string) => setDest({ ...dest, path });

  const startNextRound = () => {
    setSource((old) => {
      const newObj = { ...old };
      delete newObj["oldPath"];
      delete newObj["oldTitle"];
      return newObj;
    });
    setDest((old) => {
      const newObj = { ...old };
      delete newObj["oldPath"];
      delete newObj["oldTitle"];
      return newObj;
    });
    setRoundStarted(false);
    setRoundEnded(false);
    setShowPostround(false);
  };

  return (
    !roundStarted
      ? <Preround wsem={wsem} source={source} dest={dest} onNewSource={onNewSource} onNewDest={onNewDest} />
      : (
        !showPostround
          ? <Intraround wsem={wsem} source={source} dest={dest} players={players} allowLeaderboard={roundEnded} onLeaderboardClick={() => setShowPostround(true)} />
          : <Postround players={players} onNextRoundClick={startNextRound} />
      )
  );
};

export default Round;
