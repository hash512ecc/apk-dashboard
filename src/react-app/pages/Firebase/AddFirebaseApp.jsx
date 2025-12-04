import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Tag, Switch, message } from 'antd';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';

// 用于提交 Form 的辅助函数，确保 firebase_config 被解析为 JSON 对象
const formatPayload = (values) => {
    const payload = { ...values };
    try {
        // 尝试解析 firebase_config 字段为 JSON 对象
        payload.firebase_config = JSON.parse(payload.firebase_config);
    } catch (e) {
        // 如果解析失败，则抛出错误，Form 校验层应该处理这个
        throw new Error('Firebase Config 必须是有效的 JSON 格式');
    }
    return payload;
};

const AddFirebaseApp = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = formatPayload(values);
            await request.post('/firebase/add', payload);
            message.success('Firebase App 添加成功');
            form.resetFields();
        navigate('/firebase/list');
        } catch (error) {
            // JSON 解析错误会在这里捕获并提示
            message.error(error.message || '添加失败');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{width:"40rem",margin:"0 auto"}}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="App ID"
                    name="app_id"
                    rules={[{ required: true, message: '请输入 App ID' }]}
                >
                    <Input placeholder="例如: com.sample.android2" />
                </Form.Item>
                <Form.Item
                    label="App Name"
                    name="app_name"
                    rules={[{ required: true, message: '请输入 App 名称' }]}
                >
                    <Input placeholder="例如: sample1" />
                </Form.Item>
                <Form.Item
                    label="Firebase Config (JSON)"
                    name="firebase_config"
                    rules={[
                        { required: true, message: '请输入 Firebase Config' },
                        // 简单的 JSON 格式校验 (会在 onFinish 内部进行严格解析)
                        {
                            validator: (_, value) => {
                                try {
                                    if (value) JSON.parse(value);
                                    return Promise.resolve();
                                } catch (e) {
                                    return Promise.reject(new Error('请输入有效的 JSON 格式'));
                                }
                            }
                        }
                    ]}
                >
                    <Input.TextArea rows={4} placeholder='{"od":"aiusdhflasdf"}' />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default AddFirebaseApp;