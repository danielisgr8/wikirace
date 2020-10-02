import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route
} from "react-router-dom";
import { Layout, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { wsEvents } from "wikirace-shared";

import Home from "./Home";
import WebSocketEventManager from "../networking/websocketEventManager";
import Waiting from "./Waiting";
import Player from "../models/player";
import Round from "./Round";
import useStorageState from "../util/useStorageState";
import { isSessionPath } from "../networking/util";

import "antd/dist/antd.css";
import "./App.scss";

const { Header, Content } = Layout;
const { confirm } = Modal;

function App({ wsem }: { wsem: WebSocketEventManager }) {
  // TODO: show some toast on wsem disconnect

  const [name, setName] = useStorageState("name", "", isSessionPath());
  const [players, setPlayers] = useStorageState<Array<Player>>("players", [], isSessionPath());

  useEffect(() => {
    const handleInit = () => {
      localStorage.clear();
      wsem.addEventHandler(wsEvents.s_init, (data) => {
        localStorage.setItem("clientId", data.clientId);
        localStorage.setItem("sessionId", data.sessionId);
      });
    }

    if(isSessionPath() &&
       localStorage.getItem("clientId") !== null &&
       localStorage.getItem("sessionId") !== null) {
      wsem.addEventHandler(wsEvents.s_error, (data) => {
        if(data.code === 0) {
          handleInit();
          window.history.pushState(null, "", "/");
        }
      });
      wsem.sendMessage(wsEvents.c_reconnect, {
        clientId: Number(localStorage.getItem("clientId")),
        sessionId: localStorage.getItem("sessionId")
      });
    } else {
      handleInit();
    }
  }, [wsem]);

  const onHeaderClick = () => {
    confirm({
      title: "Are you sure you want to leave the game?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        window.location.href = "/";
      }
    });
  };

  const onNameSubmit = (name: string) => {
    setName(name);
  };

  const onPlayers = (players: Array<Player>) => {
    setPlayers(players);
  };

  return (
    <Router>
      <Layout className="App">
        <Header>
          <a onClick={(e) => { e.preventDefault(); onHeaderClick(); }} href="/" style={{ color: "inherit", textDecoration: "none" }}><b>Wikirace</b></a>
        </Header>

        <Content style={{ padding: "0.5rem 0.5rem" }}>
          <Route path="/" exact render={({ history }) => <Home wsem={wsem} history={history} onSubmit={onNameSubmit} />} />
          <Route path="/round/waiting" render={({ history }) => <Waiting wsem={wsem} name={name} history={history} onPlayers={onPlayers} />}/>
          <Route path="/round" exact render={() => <Round wsem={wsem} players={players} />} />
          <Route path="/end" />
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
