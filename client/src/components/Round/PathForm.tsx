import React, { useState } from "react";
import { Form, Input, Button, Alert } from "antd";

import "./PathForm.scss";
import { getWikiTitle } from "../../networking/util";

type PathFormProps = {
  typeText: string,
  onSubmit: (path: string, title: string) => void
}

/*
 * Examples of supported links that would all have the same group 4 (i.e. Yoshihide_Suga):
 * https://en.m.wikipedia.org/wiki/Yoshihide_Suga
 * https://en.wikipedia.org/wiki/Yoshihide_Suga
 * en.m.wikipedia.org/wiki/Yoshihide_Suga
 * en.wikipedia.org/wiki/Yoshihide_Suga
 * Yoshihide_Suga
 */
const urlPattern = /((https:\/\/)?en(\.m)?\.wikipedia\.org\/wiki\/)?(\S+)/;

const PathForm = ({ typeText, onSubmit } : PathFormProps) => {
  const [error, setError] = useState(false);

  const onFinish = (values: any) => {
    const matches = urlPattern.exec(values.path);
    if(matches === null) return;
    const page = matches[4];
    getWikiTitle(page)
      .then((title) => {
        setError(false);
        onSubmit(page, title);
      })
      .catch(() => setError(true));
  };

  return (
    <div>
      <Form className="path-form" onFinish={onFinish} >
        <Form.Item name="path" rules={[{ pattern: urlPattern, message: "Invalid URL format" }]}>
          <Input placeholder={`${typeText} URL`} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button">
            Set
          </Button>
        </Form.Item>
      </Form>
      {error && <Alert type="error" message="URL does not correspond to a Wikipedia page" />}
    </div>

  );
};

export default PathForm;
