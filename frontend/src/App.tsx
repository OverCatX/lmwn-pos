import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Layout from './components/Layout';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';

/**
 * Main Application Component
 */
function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#00b96b',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
