import React, { useEffect, useState } from 'react';
import { initializeFirebase } from '../../utils/firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from './service-account.json';
import { Table, Modal, Button, Form, Input, Select, Space, Typography, Spin, message } from 'antd';

const emptyItem = {
    app_id: '',
    name: '',
    app_type: 'ANDROID',
    download_url: '',
    market_url: '',
    region: '',
    start_clz: '',
    onelink: '',
    launch_url: '',
    facebook_hash: ''
}

export default function FirebaseApps() {
    const [db, setDb] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [addLoading, setAddLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        try {
            const database = initializeFirebase(JSON.stringify(firebaseConfig));
            setDb(database);
        } catch (e) {
            console.error('init firebase failed', e);
        }
    }, []);

    useEffect(() => {
        if (!db) return;
        fetchItems();
    }, [db]);

    async function fetchItems() {
        setLoading(true);
        try {
            const q = await getDocs(collection(db, 'app_configs'));
            const arr = q.docs.map(d => ({ __docId: d.id, ...d.data() }));
            setItems(arr);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function openEdit(item) {
        setEditItem({ ...item });
        editForm.setFieldsValue(item);
        setShowEdit(true);
    }

    async function saveEdit(values) {
        if (!editItem || !editItem.__docId) return;
        const ref = doc(db, 'app_configs', editItem.__docId);
        const payload = { ...values };
        setEditLoading(true);
        try {
            await updateDoc(ref, payload);
            message.success('保存成功');
            setShowEdit(false);
            setEditItem(null);
            await fetchItems();
        } catch (e) {
            console.error('save edit failed', e);
            message.error('保存失败');
        } finally {
            setEditLoading(false);
        }
    }

    async function createNew(values) {
        if (!values.app_id) {
            message.error('请填写 app_id');
            return;
        }
        setAddLoading(true);
        try {
            // use app_id as document id
            await setDoc(doc(db, 'app_configs', values.app_id), values);
            message.success('创建成功');
            setShowAdd(false);
            addForm.resetFields();
            await fetchItems();
        } catch (e) {
            console.error('create failed', e);
            message.error('创建失败');
        } finally {
            setAddLoading(false);
        }
    }

    return (
        <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Firebase App Configs</h2>
                <div>
                    <button onClick={() => setShowAdd(true)} style={{ padding: '8px 12px' }}>添加 App</button>
                </div>
            </div>

            <div style={{ marginTop: 12 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin tip="加载中..." />
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>暂无配置</div>
                ) : (
                    <Table
                        loading={loading}
                        dataSource={items.map(i => ({ key: i.__docId, ...i }))}
                        pagination={{ pageSize: 10 }}
                        columns={[
                            { title: 'App ID', dataIndex: 'app_id', key: 'app_id', width: 180 },
                            { title: '应用名称', dataIndex: 'name', key: 'name', width: 200 },
                            { title: '应用类型', dataIndex: 'app_type', key: 'app_type', width: 120 },
                            { title: '地区', dataIndex: 'region', key: 'region', width: 120 },
                            {
                                title: '下载地址', dataIndex: 'download_url', key: 'download_url', render: (text) => text && (
                                    <div>
                                        <Typography.Text ellipsis copyable={{ text: text || '' }}>{text || ''}</Typography.Text>
                                    </div>
                                ) || '-',
                            },
                            {
                                title: '市场地址', dataIndex: 'market_url', key: 'market_url', render: (text) => text && (
                                    <div>
                                        <Typography.Text ellipsis copyable={{ text: text || '' }}>{text || ''}</Typography.Text>
                                    </div>
                                ) || '-',
                            },
                            { title: '启动类', dataIndex: 'start_clz', key: 'start_clz', width: 80 },
                            {
                                title: '操作', key: 'actions', width: 140, render: (_, record) => (
                                    <Space>
                                        <Button type="primary" onClick={() => openEdit(record)}>编辑</Button>
                                    </Space>
                                )
                            },
                        ]}
                    />
                )}
            </div>

            <Modal
                title="添加 AppConfig"
                open={showAdd}
                onCancel={() => setShowAdd(false)}
                onOk={() => {
                    addForm.validateFields().then(values => createNew(values));
                }}
                confirmLoading={addLoading}
            >
                <Form form={addForm} layout="vertical" initialValues={emptyItem}>
                    <Form.Item name="app_id" label="bundle ID或包名" rules={[{ required: true, message: '请填写 app_id' }]}>

                        <Input />
                    </Form.Item>
                    <Form.Item name="name" label="应用名称">
                        <Input />
                    </Form.Item>
                    <Form.Item name="region" label="地区">
                        <Input />
                    </Form.Item>
                    <Form.Item name="app_type" label="应用类型">
                        <Select>
                            <Select.Option value="">(空)</Select.Option>
                            <Select.Option value="IOS">IOS</Select.Option>
                            <Select.Option value="ANDROID">ANDROID</Select.Option>
                            <Select.Option value="APK">APK</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="download_url" label="下载地址">
                        <Input />
                    </Form.Item>
                    <Form.Item name="market_url" label="市场地址">
                        <Input />
                    </Form.Item>
                    <Form.Item name="onelink" label="onelink">
                        <Input />
                    </Form.Item>
                    <Form.Item name="launch_url" label="唤醒链接">
                        <Input />
                    </Form.Item>
                    <Form.Item name="facebook_hash" label="facebook_hash">
                        <Input />
                    </Form.Item>
                    <Form.Item name="start_clz" label="启动类">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="编辑 AppConfig"
                open={showEdit}
                onCancel={() => { setShowEdit(false); setEditItem(null); }}
                onOk={() => {
                    editForm.validateFields().then(values => saveEdit(values));
                }}
                confirmLoading={editLoading}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item name="app_id" label="app_id">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="name" label="应用名称">
                        <Input />
                    </Form.Item>
                    <Form.Item name="region" label="地区">
                        <Input />
                    </Form.Item>
                    <Form.Item name="app_type" label="应用类型">
                        <Select>
                            <Select.Option value="IOS">IOS</Select.Option>
                            <Select.Option value="ANDROID">ANDROID</Select.Option>
                            <Select.Option value="APK">APK</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="download_url" label="下载地址">
                        <Input />
                    </Form.Item>
                    <Form.Item name="market_url" label="市场地址">
                        <Input />
                    </Form.Item>
                    <Form.Item name="onelink" label="onelink">
                        <Input />
                    </Form.Item>
                    <Form.Item name="launch_url" label="唤醒链接">
                        <Input />
                    </Form.Item>
                    <Form.Item name="start_clz" label="启动类">
                        <Input />
                    </Form.Item>
                    <Form.Item name="facebook_hash" label="facebook_hash">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

const thStyle = { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #eee' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #f3f3f3' };
const trStyle = { background: '#fff' };

