// src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { UserOutlined, AppstoreOutlined, LogoutOutlined,DatabaseOutlined  } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/apps',
      icon: <AppstoreOutlined />,
      label: 'APK',
      children: [
        { key: '/apps/list', label: 'List' },
        { key: '/apps/add', label: 'New' },
      ],
    },
    {
      key: '/firebase',
      icon: <DatabaseOutlined />, 
      label: 'Firebase',
      children: [
        { key: '/firebase/list', label: 'List' },
        { key: '/firebase/add', label: 'New' },
      ],
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'User',
      children: [
        { key: '/users/list', label: 'List' },
        { key: '/users/add', label: 'New' },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh',width:"100vw" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme="light">
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 77, 79, 0.2)', borderRadius: 6, display:'flex', alignItems:'center', justifyContent:'center', color: '#cf1322', fontWeight:'bold' }}>
           {collapsed ? 'Package' : 'Package Dashboard'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          defaultOpenKeys={['/apps']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
          {/* <a href='/'><h2 style={{ margin: 0, color: '#cf1322' }}>Package Management</h2></a> */}
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} danger>
            Sign out
          </Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;