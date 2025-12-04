// src/pages/Login.jsx
import React from 'react';
import { Button, Form, Input, Card, message, theme } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import request from '../utils/request';
import { useNavigate } from 'react-router-dom';
import { encryptoPassword } from '../utils/passkey';

const Login = () => {
    const navigate = useNavigate();
    const { token: { colorPrimary } } = theme.useToken();

    const onFinish = async (values) => {
        try {
            const { username, password } = values;
            const res = await request.post('/user/signin', {
                username,
                password: encryptoPassword(password)
            });
            // 存储 Token
            localStorage.setItem('token', res.data.token);
            message.success('login Successful');
            navigate('/'); // 登录后默认跳转
        } catch (error) {
            // 错误已在拦截器处理
            console.error(error);
        }
    };

    return (
        <div style={{ width: "100vw", display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
            <Card
                style={{ width: "25rem", boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                title={<div style={{ textAlign: 'center', color: colorPrimary, fontSize: 24 }}>Package Dashboard</div>}
            >
                <Form
                    name="login"
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'username required' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'password required' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ background: colorPrimary }}>
                            Sign in
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;