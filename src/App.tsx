import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { HomeOutlined, DatabaseOutlined, RobotOutlined } from '@ant-design/icons';
import DinosaurList from './components/DinosaurList';
import DinosaurDetail from './components/DinosaurDetail';
import AdminPanel from './components/AdminPanel';
import './styles/responsive.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

type ViewType = 'list' | 'detail' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedDinosaurId, setSelectedDinosaurId] = useState<string>('');

  const handleViewDetail = (id: string) => {
    setSelectedDinosaurId(id);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedDinosaurId('');
  };

  const menuItems = [
    {
      key: 'list',
      icon: <HomeOutlined />,
      label: '恐龙百科',
    },
    {
      key: 'admin',
      icon: <DatabaseOutlined />,
      label: '管理后台',
    },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'detail':
        return (
          <DinosaurDetail
            dinosaurId={selectedDinosaurId}
            onBack={handleBackToList}
          />
        );
      case 'admin':
        return (
          <AdminPanel onBack={handleBackToList} />
        );
      case 'list':
      default:
        return <DinosaurList onViewDetail={handleViewDetail} />;
    }
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', top: 0 }}>
        <div className="container flex justify-between items-center" style={{ height: '100%' }}>
          <div className="logo flex items-center">
            <RobotOutlined style={{ fontSize: '24px', color: '#1890ff', marginRight: '12px' }} />
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              恐龙百科
            </Title>
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentView]}
            items={menuItems}
            onClick={({ key }) => setCurrentView(key as ViewType)}
            style={{ flex: 1, justifyContent: 'flex-end', border: 'none' }}
            className="mobile-hidden"
          />
        </div>
      </Header>
      
      <Content style={{ padding: '24px', marginTop: '64px' }}>
        <div className="container">
          {renderContent()}
        </div>
      </Content>
      
      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <div className="container">
          <p style={{ margin: 0, color: '#8c8c8c' }}>
            恐龙百科 ©2024 - 探索史前世界的奥秘
          </p>
        </div>
      </Footer>
      
      {/* 移动端底部导航 */}
      <div className="mobile-nav tablet-hidden desktop-hidden">
        <Menu
          mode="horizontal"
          selectedKeys={[currentView]}
          items={menuItems}
          onClick={({ key }) => setCurrentView(key as ViewType)}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderTop: '1px solid #f0f0f0',
            justifyContent: 'center',
          }}
        />
      </div>
      
      <style>{`
        .layout {
          background: #f0f2f5;
        }
        
        .logo {
          display: flex;
          align-items: center;
        }
        
        .mobile-nav {
          display: none;
        }
        
        @media (max-width: 768px) {
          .mobile-nav {
            display: block;
          }
          
          .layout {
            padding-bottom: 50px;
          }
          
          .container {
            padding: 0 12px;
          }
        }
        
        @media (max-width: 480px) {
          .logo h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </Layout>
  );
}

export default App;
