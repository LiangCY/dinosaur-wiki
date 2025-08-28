import { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { HomeOutlined, RobotOutlined } from '@ant-design/icons';
import DinosaurList from './pages/home/DinosaurList';
import AdminPage from './pages/admin';
import DinosaurDetailPage from './pages/detail';
import './styles/responsive.css';
import { Routes, Route, Link } from 'react-router-dom';
import './styles/responsive.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [currentView, setCurrentView] = useState('list');

  const menuItems = [
    {
      key: 'list',
      icon: <HomeOutlined />,
      label: '恐龙百科',
    },
  ];

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', top: 0 }}>
        <div
          className="container flex justify-between items-center"
          style={{ height: '100%' }}
        >
          <div className="logo flex items-center">
            <RobotOutlined
              style={{
                fontSize: '24px',
                color: '#1890ff',
                marginRight: '12px',
              }}
            />
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                恐龙百科
              </Link>
            </Title>
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[currentView]}
            items={menuItems}
            onClick={({ key }) => setCurrentView(key)}
            style={{ flex: 1, justifyContent: 'flex-end', border: 'none' }}
            className="mobile-hidden"
          />
        </div>
      </Header>

      <Content style={{ padding: '24px', marginTop: '64px' }}>
        <div className="container">
          <Routes>
            <Route path="/" element={<DinosaurList />} />
            <Route path="/dinosaur/:id" element={<DinosaurDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
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
          onClick={({ key }) => setCurrentView(key)}
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
