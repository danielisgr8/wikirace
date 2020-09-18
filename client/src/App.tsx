import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route
} from "react-router-dom";
import { Layout } from "antd";
import { wsEvents } from "wikirace-shared";

import Home from "./Home";
import WebSocketEventManager from "./networking/websocketEventManager";

import "antd/dist/antd.css";
import "./App.scss";

const { Header, Content } = Layout;

const isSessionPath = () => ["/", "/end"].every(path => window.location.pathname !== path);

function App({ wsem }: { wsem: WebSocketEventManager }) {
  // TODO: show some toast on wsem disconnect

  const [source, setSource] = useState("");
  const [dest, setDest] = useState("");

  useEffect(() => {
    if(isSessionPath() &&
       localStorage.getItem("clientId") !== null &&
       localStorage.getItem("sessionId") !== null) {
      wsem.addEventHandler(wsEvents.s_error, (data) => {
        // TODO: check if code is 0
        // TODO: go back home
        // TODO: clear local storage and add s_init event handler (turn else statement below into function)
      });
      wsem.sendMessage(wsEvents.c_reconnect, {
        clientID: Number(localStorage.getItem("clientId")),
        sessionID: localStorage.getItem("sessionId")
      });
    } else {
      localStorage.clear();
      wsem.addEventHandler(wsEvents.s_init, (data) => {
        localStorage.setItem("clientId", data.clientID);
        localStorage.setItem("sessionId", data.sessionID);
      });
    }
  }, [wsem]);

  return (
    <Router>
      <Layout className="App">
        <Header>
          <b>Wikirace</b>
        </Header>

        <Content style={{ padding: "0.5rem 0.5rem" }}>
          <Route path="/" exact render={({ history }) => <Home wsem={wsem} history={history} />} />
          <Route path="/round/waiting" />
          <Route path="/round" exact />
          <Route path="/end" />
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
