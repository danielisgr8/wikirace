import React from "react";
import { Form, Input, Button } from "antd";
import { History } from "history";
import { wsEvents } from "wikirace-shared";

import WebSocketEventManager from "../networking/websocketEventManager";

type HomeProps  = {
  wsem: WebSocketEventManager,
  history: History,
  onSubmit: (name: string) => void
}

const Home = ({ wsem, history, onSubmit }: HomeProps) => {
  const onFinish = (name: string) => {
    onSubmit(name);
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