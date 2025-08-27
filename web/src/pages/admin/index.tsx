import React from 'react';
import { Button, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import { DatabaseOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <h2 style={{ margin: 0 }}>
          <DatabaseOutlined style={{ marginRight: 8 }} />
          管理后台
        </h2>
        <Button onClick={handleBack}>返回恐龙百科</Button>
      </Header>
      <Content style={{ padding: '24px' }}>
        <AdminPanel onBack={handleBack} />
      </Content>
    </Layout>
  );
};

export default AdminPage;
