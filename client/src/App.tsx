import React from 'react';
import { Layout, Form, Input, Button } from "antd";

import 'antd/dist/antd.css';
import './App.scss';

const { Header, Content } = Layout;

function App() {
  return (
    <Layout className="App">
      <Header>
        <b>Wikirace</b>
      </Header>

      <Content style={{ padding: "0.5rem 0.5rem" }}>
        <Form onFinish={(values) => console.log(values)} >
          <Form.Item name="name">
            <Input placeholder="Name" size="large" />
          </Form.Item>

          <Form.Item>
            <Button size="large" type="primary" htmlType="submit" className="login-form-button">
              Join
            </Button>
      </Form.Item>
        </Form>
      </Content>
    </Layout>

  );
}

export default App;
