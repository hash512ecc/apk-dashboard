// src/pages/Firebase/FirebaseList.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Tag, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import request from '../../utils/request';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getFirebaseConfig, updateFirebaseConfig } from '../../utils/firebase';

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


const FirebaseList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isUpdateFbModalVisible, setUpdateModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [selectedApp, setSelectedApp] = useState(null);
    const navigate = useNavigate();

    // 列表获取函数
    const fetchList = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await request.get(`/firebase/list?page=${page}&pageSize=${pageSize}`);
            if (res.data && res.data.data) {
                setData(res.data.data);
                setPagination({
                    current: res.data.page,
                    pageSize: res.data.pageSize,
                    total: res.data.total
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    // 处理状态开关（模拟）
    const handleStatusChange = (checked, record) => {
        const newStatus = checked ? 1 : 0;
        request.post("/firebase/update", {
            app_id: record.app_id,
            status: newStatus
        }).then(() => {
            setData(data.map(item => item.app_id === record.app_id ? { ...item, status: newStatus } : item))
        });
    };

    // 弹窗提交
    const onFinish = async (values) => {
        try {
            console.log(values);
            const { url, vpns, app_id } = values;
            if (app_id == selectedApp?.app_id) {
                let vpnArray = vpns.split(/\s+/)
                console.log("array", vpnArray);
                setLoading(true);
                updateFirebaseConfig(selectedApp?.firebase_config, url, vpnArray).then(() => {
                    setUpdateModalVisible(false);
                }).finally(() => {
                    setLoading(false);
                });
            }
        } catch (error) {
            // JSON 解析错误会在这里捕获并提示
            message.error(error.message || '添加失败');
        }
    };

    const handleEdit = (record) => {
        setSelectedApp(record);
        form.setFieldValue("app_name", record.app_name);
        form.setFieldValue("app_id", record.app_id);
        setUpdateModalVisible(true);
        getFirebaseConfig(record.firebase_config).then((result) => {
            console.log("result", result);
            let [url, vpns] = result;
            url && form.setFieldValue("url", url);
            vpns && form.setFieldValue("vpns", `${vpns.split(",").join("\n")}`);
        }).catch(error => {
            console.error(error);
        })
    };

    const columns = [
        {
            title: 'App ID', dataIndex: 'app_id', key: 'app_id', render: (_, record) => (
                <a href={`https://play.google.com/store/apps/details?id=${record.app_id}`}>{record.app_id}</a>
            )
        },
        { title: 'App 名称', dataIndex: 'app_name', key: 'app_name' },
        // {
        //     title: '配置',
        //     dataIndex: 'firebase_config',
        //     key: 'firebase_config',
        //     ellipsis: true, // 文本过长时显示省略号
        //     width: 250,
        //     render: (text) => <span title={text}>{text}</span> // 鼠标悬停显示完整内容
        // },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Space>
                    <Switch
                        checked={status === 1}
                        onChange={(checked) => handleStatusChange(checked, record)}
                        checkedChildren="Online"
                        unCheckedChildren="Suspend"
                    />
                    {/* <Tag color={status === 1 ? 'green' : 'red'}>
                        {status === 1 ? 'Active' : 'Suspend'}
                    </Tag> */}
                </Space>
            )
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            render: (ts, record) => ts ? `${dayjs(ts * 1000).format('YYYY-MM-DD')} by ${record.created_by}` : '-'
        },
        {
            title: '更新时间',
            dataIndex: 'updated_at',
            render: (ts, record) => ts ? `${dayjs(ts * 1000).format('YYYY-MM-DD')} by ${record.updated_by || record.updated_by}` : '-'
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            render: (_, record) => (
                <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
                <div style={{ fontSize: 16, fontWeight: 'bold' }}>Firebase App 列表</div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/firebase/add')}>
                    Add new Firebase App
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="app_id"
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: (page, pageSize) => fetchList(page, pageSize)
                }}
            />

            <Modal
                title="Update Firebase"
                open={isUpdateFbModalVisible}
                onCancel={() => { setUpdateModalVisible(false); form.resetFields(); }}
                onOk={() => form.submit()}
                confirmLoading={loading}>
                <Form form={form} onFinish={onFinish}>
                    <Form.Item
                        label="App Name"
                        name="app_name" layout="vertical"
                        rules={[{ required: true, message: '请输入 App 名称' }]}>
                        <Input placeholder="app name" disabled />
                    </Form.Item>

                    <Form.Item
                        label="App ID" layout="vertical"
                        name="app_id"
                        rules={[{ required: true, message: '请输入 App Id' }]}>
                        <Input placeholder="com.sample.android2" disabled />
                    </Form.Item>

                    <Form.Item label="Url" layout="vertical"
                        name="url">
                        <Input placeholder='url to set for firebase' />
                    </Form.Item>
                    <Form.Item label="VPN(Seperated by new line)" layout="vertical"
                        name="vpns">
                        <Input.TextArea rows={4} placeholder='{"od":"aiusdhflasdf"}' />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FirebaseList;