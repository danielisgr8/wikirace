import React from "react";
import { Table } from "antd";

import Player from "../../models/player";

type TimeLeaderboardProps = {
  playerCount: number;
  finishedPlayers: Array<Player>;
}

const timeLeaderBoardColumns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key"
  },
  {
    title: "Player",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time"
  }
];

const TimeLeaderboard = ({ playerCount, finishedPlayers}: TimeLeaderboardProps) => {
  finishedPlayers.sort((player1, player2) => player1.time - player2.time);

  const data = new Array<any>(playerCount);
  for(let i = 0; i < playerCount; i++) {
    const element: any = { key: i + 1 };
    if(i < finishedPlayers.length) {
      element.name = finishedPlayers[i].name;
      element.time = finishedPlayers[i].time;
    } else {
      element.name = "-";
      element.time = "-";
    }
    data[i] = element;
  }

  return <Table columns={timeLeaderBoardColumns} dataSource={data} pagination={false} />;
};

type ScoreLeaderboardProps = {
  players: Array<Player>;
}

const scoreLeaderBoardColumns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key"
  },
  {
    title: "Player",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "Score",
    dataIndex: "score",
    key: "score"
  },
  {
    title: "Change",
    dataIndex: "change",
    key: "change"
  }
];

const ScoreLeaderboard = ({ players }: ScoreLeaderboardProps) => {
  players.sort((player1, player2) => player1.score - player2.score).reverse();

  const data = players.map((player, index) => ({
    key: index + 1,
    name: player.name,
    score: player.score,
    change: player.change
  }));

  return <Table columns={scoreLeaderBoardColumns} dataSource={data} pagination={false} />;
};

export { TimeLeaderboard, ScoreLeaderboard };
