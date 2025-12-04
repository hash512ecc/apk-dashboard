// src/pages/User/UserList.jsx
import React, { useEffect, useState } from 'react';
import { Table, Tag,Switch,Space } from 'antd';
import request from '../../utils/request';
import dayjs from 'dayjs';
import { EditOutlined } from '@ant-design/icons';

const UserList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await request.get('/user/users');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = (checked, record) => {
    const newStatus = checked ? 1 : 0;
    request.post("/user/update", {
      id: record.id,
      status: newStatus
    }).then(() => {
      setData(data.map(item => item.id === record.id ? { ...item, status: newStatus } : item))
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={role === 1 ? 'red' : 'blue'}>{role === 1 ? '管理员' : '普通用户'}</Tag>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (ts) => dayjs(ts * 1000).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '最后登录',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      render: (ts) => dayjs(ts * 1000).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space>
          <Switch
            checked={status === 1}
            onChange={(checked) => handleStatusChange(checked, record)}
            checkedChildren="Enabled"
            unCheckedChildren="Disabled"
          />
        </Space>
      )
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="id" loading={loading} title={() => '所有用户'} />;
};

export default UserList;