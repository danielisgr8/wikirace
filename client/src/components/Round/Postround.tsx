import React from "react";
import { Row, Col, Button } from "antd";

import Player from "../../models/player";
import { ScoreLeaderboard } from "./Leaderboards";

type PostroundProps = {
  players: Array<Player>,
  onNextRoundClick: () => void
};

const Postround = ({ players, onNextRoundClick }: PostroundProps) => {
  return (
    <div>
      <Row justify="end" >
        <Col span={8}>
          <Button type="primary" size="large" onClick={onNextRoundClick}>Next round</Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <h2>Leaderboard</h2>
        </Col>
      </Row>
      <Row style={{ justifyContent: "center" }}>
        <ScoreLeaderboard players={players} />
      </Row>
    </div>
  );
};

export default Postround;
