// src/pages/App/AppList.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, message, Tag, Switch, Flex, Tooltip, AutoComplete } from 'antd';
import { SearchOutlined, EditOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons';
import request from '../../utils/request';
import dayjs from 'dayjs';

const AppList = () => {
  // 列表数据状态
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // 更新弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);
  const [form] = Form.useForm();
  const [countryOptions, setCountryOptions] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await request.get('/app/countries');
        if (res.code === 200 && Array.isArray(res.data)) {
          //将接口返回的 ["India", "Paskasia"] 转换为 [{value: 'India'}, ...] 格式
          const options = res.data.map(item => ({ value: item, label: item }));
          setCountryOptions(options);
        }
      } catch (error) {
        console.error('获取国家列表失败', error);
      }
    };
    fetchCountries();
  }, []);
  // 获取列表
  const fetchList = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await request.get(`/app/list?page=${page}&pageSize=${pageSize}`);
      // 注意：根据你的接口文档，数据在 res.data.data 中
      setListData(res.data.data);
      setPagination({
        current: res.data.page,
        pageSize: res.data.pageSize,
        total: res.data.total
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 根据 app_id 搜索
  const onSearch = async (value) => {
    if (!value) {
      fetchList(1, 20); // 如果清空搜索，展示列表
      return;
    }
    setLoading(true);
    try {
      const res = await request.get(`/app/app?id=${value}`);
      if (res.data) {
        // 将单个对象放入数组以展示在 Table 中
        setListData([res.data]);
        setPagination({ ...pagination, total: 1 });
      } else {
        setListData([]);
        message.warning('未找到相关App');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 打开更新弹窗
  const handleEdit = (record) => {
    setCurrentApp(record);
    form.setFieldsValue(record); // 回填数据
    form.setFieldValue("vpn",record.vpn.join('\n'));
    setIsModalOpen(true);
  };

  // 提交更新
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      // 接口要求 app_id 为标识，其他字段更新
      let vpnArray = values.vpn && values.vpn.split(/\s+/) || undefined
      const payload = {
        app_id: currentApp.app_id, // 确保 ID 存在
        ...values,
        vpn: vpnArray
      };

      await request.post('/app/update', payload);
      message.success('更新成功');
      setIsModalOpen(false);
      fetchList(pagination.current, pagination.pageSize); // 刷新列表
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const columns = [
    { title: 'App ID', dataIndex: 'app_id', key: 'app_id', fixed: 'left' },
    { title: '版本', dataIndex: 'app_version', key: 'app_version' },
    { title: '国家', dataIndex: 'country', key: 'country' },
    // {
    //   title: '状态',
    //   dataIndex: 'is_active',
    //   render: (val) => <Tag color={val === 1 ? 'green' : 'red'}>{val === 1 ? 'Enabled' : 'Disabled'}</Tag>
    // },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (text) => text && (<Flex>
        <Tooltip title={text}>
          <CopyOutlined size="large" onClick={() => {
            navigator.clipboard.writeText(text).then(() => message.success("copied"));
          }} />
        </Tooltip>
      </Flex>) || (<span>-</span>)
    },
    {
      title: "VPN",
      dataIndex: "vpn",
      key: "vpn",
      render: (vpn, record) => {
        if (vpn && vpn.length) {
          return (
            <Tooltip title={<Flex vertical>{vpn.map((item) => (<span>{item}</span>))}</Flex>}>
              <CopyOutlined size="large" onClick={() => {
                navigator.clipboard.writeText(vpn.join('\n')).then(() => message.success("copied"));
              }} />
            </Tooltip>
          );
        } else {
          return (<span>-</span>)
        }
      }
    },
    {
      title: '下载链接', dataIndex: 'download_url', key: 'download_url', ellipsis: true,
      render: (text) => text && (<Flex>
        <Tooltip title={text}>
          <CopyOutlined size="large" onClick={() => {
            navigator.clipboard.writeText(text).then(() => message.success("copied"));
          }} />
        </Tooltip>
      </Flex>) || (<span>-</span>)
    },
    {
      title: '创建时间',
      dataIndex: 'create_date',
      render: (ts, record) => ts ? `${dayjs(ts * 1000).format('YYYY-MM-DD')} by ${record.added_by}` : '-'
    },
    {
      title: '更新时间',
      dataIndex: 'update_date',
      render: (ts, record) => ts ? `${dayjs(ts * 1000).format('YYYY-MM-DD')} by ${record.updated_by || record.added_by}` : '-'
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <div style={{ fontSize: 16, fontWeight: 'bold' }}>Application 列表</div>
        <Input.Search
          placeholder="输入 App ID 查询详情"
          allowClear
          enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
          size="large"
          onSearch={onSearch}
          style={{ width: 400 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={listData}
        rowKey="app_id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchList(page, pageSize)
        }}
        scroll={{ x: 1300 }}
      />

      <Modal
        title={`更新应用: ${currentApp?.app_id}`}
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="URL" name="url">
            <Input />
          </Form.Item>
          <Form.Item label="VPN(Seperated by new line)" layout="vertical"
            name="vpn">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="应用版本" name="app_version">
            <Input />
          </Form.Item>
          <Form.Item label="下载链接" name="download_url">
            <Input />
          </Form.Item>
          <Form.Item label="更新日志" name="version_log">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="国家" name="country">
            <AutoComplete
              options={countryOptions}
              placeholder="请输入国家或从列表中选择"
              // 添加筛选功能：输入 'In' 能筛选出 'India'
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
            />
          </Form.Item>
          {/* <Form.Item label="状态" name="is_active">
            <Switch defaultChecked={currentApp?.status == 1} />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default AppList;