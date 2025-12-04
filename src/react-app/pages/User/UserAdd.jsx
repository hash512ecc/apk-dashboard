// src/pages/User/UserAdd.jsx
import React from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';
import { encryptoPassword } from '../../utils/passkey';

const UserAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const { username, password } = values;
      const res = await request.post('/user/add', {
          username,
          password: encryptoPassword(password)
      });
      message.success('Create user successful');
      navigate('/users/list');
    } catch (error) {
      // 错误已在拦截器处理
    }
  };

  return (
    <Card title="新建用户" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Username required' }]}>
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item label="Passowrd" name="password" rules={[{ required: true, message: 'Password required' }]}>
          <Input.Password placeholder="Passowrd" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Create User</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserAdd;