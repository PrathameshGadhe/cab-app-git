import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import PaymentList from '../pages/billing/PaymentList';
import PaymentForm from '../pages/billing/PaymentForm';
import InvoiceList from '../pages/billing/InvoiceList';
import InvoiceForm from '../pages/billing/InvoiceForm';
import InvoiceView from '../pages/billing/InvoiceView';

const { Content } = Layout;

const BillingLayout = () => (
  <Layout style={{ minHeight: '100vh' }}>
    <Sidebar activeKey="billing" />
    <Layout className="site-layout">
      <Header />
      <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        <div className="site-layout-background" style={{ padding: 24 }}>
          <Routes>
            <Route path="payments" element={<PaymentList />} />
            <Route path="payments/new" element={<PaymentForm />} />
            <Route path="payments/:id" element={<PaymentForm />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/new" element={<InvoiceForm />} />
            <Route path="invoices/:id" element={<InvoiceForm />} />
            <Route path="invoices/view/:id" element={<InvoiceView />} />
          </Routes>
        </div>
      </Content>
    </Layout>
  </Layout>
);

export default BillingLayout;
