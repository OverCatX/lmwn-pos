import { useState } from 'react';
import { Layout as AntLayout, Menu, theme } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main Layout Component with Sidebar Navigation
 */
function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: 'Orders',
    },
    {
      key: '/products',
      icon: <AppstoreOutlined />,
      label: 'Products',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 18 : 20,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'POS' : 'LMWN POS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined
              style={{ fontSize: 18, cursor: 'pointer' }}
              onClick={() => setCollapsed(!collapsed)}
            />
          ) : (
            <MenuFoldOutlined
              style={{ fontSize: 18, cursor: 'pointer' }}
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
          <h1 style={{ margin: '0 0 0 24px', fontSize: 20 }}>
            {location.pathname === '/orders' 
              ? 'Order Management' 
              : location.pathname === '/products'
              ? 'Products Catalog'
              : 'Sales Reports'}
          </h1>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;
