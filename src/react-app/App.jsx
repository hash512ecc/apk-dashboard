// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import UserList from './pages/User/UserList';
import UserAdd from './pages/User/UserAdd';
import AppList from './pages/App/AppList';
import AppAdd from './pages/App/AppAdd'
import FirebaseList from './pages/Firebase/FirebaseList';
import AddFirebaseApp from './pages/Firebase/AddFirebaseApp';

// 路由守卫组件
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#f5222d', // 红色主题
          borderRadius: 4,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
             {/* 默认重定向到用户列表 */}
             <Route index element={<Navigate to="/apps/list" />} />
             
             {/* 用户模块 */}
             <Route path="users/list" element={<UserList />} />
             <Route path="users/add" element={<UserAdd />} />

             {/* Application模块 */}
             <Route path="apps/list" element={<AppList />} />
             <Route path="apps/add" element={<AppAdd />} />

             <Route path="firebase/list" element={<FirebaseList />} />
             <Route path='firebase/add' element={<AddFirebaseApp/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;