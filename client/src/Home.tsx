import React from "react";
import { Form, Input, Button } from "antd";
import { History } from "history";

import WebSocketEventManager from "./networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";

const Home = ({ wsem, history }: { wsem: WebSocketEventManager, history: History }) => {
  const onFinish = (name: string) => {
    wsem.sendMessage(wsEvents.c_join, { name });
    history.push("/round/waiting");
  };

  return (
    <Form onFinish={(values) => onFinish(values.name)} >
      <Form.Item name="name">
        <Input placeholder="Name" size="large" />
      </Form.Item>
  
      <Form.Item>
        <Button size="large" type="primary" htmlType="submit" className="login-form-button">
          Join
        </Button>
      </Form.Item>
    </Form>
  )

};

export default Home;