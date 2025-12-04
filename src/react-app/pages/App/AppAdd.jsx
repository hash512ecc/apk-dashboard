// src/pages/App/AppAdd.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, AutoComplete } from 'antd';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';

const AppAdd = () => {
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]); // 2. 定义状态存储国家列表
  const navigate = useNavigate();

  // 3. 获取国家列表的副作用
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await request.get('/app/countries');
        if (res.code === 200 && Array.isArray(res.data)) {
          // 4. 将接口返回的 ["India", "Paskasia"] 转换为 [{value: 'India'}, ...] 格式
          const options = res.data.map(item => ({ value: item, label: item }));
          setCountryOptions(options);
        }
      } catch (error) {
        console.error('获取国家列表失败', error);
      }
    };
    fetchCountries();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await request.post('/app/add', {
        ...values,
        vpn:values.vpn && values.vpn.split(/\s+/) || undefined
      });
      message.success('应用创建成功');
      navigate('/apps/list');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="新建 Application" bordered={false}>
      <Form
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form.Item
          label="App ID"
          name="app_id"
          rules={[{ required: true, message: '请输入 App ID' }]}
        >
          <Input placeholder="例如: com.sample.android2" />
        </Form.Item>

        <Form.Item
          label="版本 (Version)"
          name="version"
          rules={[{ required: true, message: '请输入版本号' }]}
        >
          <Input placeholder="例如: 1.0.0" />
        </Form.Item>

        <Form.Item
          label="URL链接"
          name="url"
          rules={[
            { required: true, message: '请输入 URL' },
            { type: 'url', message: '请输入有效的 URL 格式' }
          ]}
        >
          <Input.TextArea rows={3} placeholder="https://google.com/..." />
        </Form.Item>
        <Form.Item label="VPN(Seperated by new line)" layout="vertical"
          name="vpn">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          label="国家 (Country)"
          name="country"
          rules={[{ required: true, message: '请输入或选择国家' }]}
        >
          <AutoComplete
            options={countryOptions}
            placeholder="请输入国家或从列表中选择"
            // 添加筛选功能：输入 'In' 能筛选出 'India'
            filterOption={(inputValue, option) =>
              option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            提交
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AppAdd;