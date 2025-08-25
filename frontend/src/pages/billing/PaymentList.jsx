import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, DatePicker, Select, Card, Tag } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null,
    search: ''
  });
  const navigate = useNavigate();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status,
        search: filters.search,
      };
      
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await api.get('/drivers/payments', { params });
      setPayments(response.data.payments);
      setPagination({
        ...pagination,
        total: response.data.count,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [pagination.current, filters]);

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleDateChange = (dates) => {
    setFilters({ ...filters, dateRange: dates });
    setPagination({ ...pagination, current: 1 });
  };

  const handleStatusChange = (value) => {
    setFilters({ ...filters, status: value });
    setPagination({ ...pagination, current: 1 });
  };

  const columns = [
    {
      title: 'Payment ID',
      dataIndex: '_id',
      key: 'id',
      render: (id) => id.slice(-6).toUpperCase(),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount.toFixed(2)}`,
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      key: 'method',
      render: (method) => method.toUpperCase(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Collected By',
      dataIndex: 'collectedBy',
      key: 'collectedBy',
      render: (user) => user?.name || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => navigate(`/billing/payments/${record._id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="payment-list">
      <Card 
        title="Payment Records" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/billing/payments/new')}
          >
            Record Payment
          </Button>
        }
      >
        <div className="filters" style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by ID or customer name"
            prefix={<SearchOutlined />}
            style={{ width: 300, marginRight: 16 }}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Filter by status"
            style={{ width: 150, marginRight: 16 }}
            allowClear
            onChange={handleStatusChange}
          >
            <Option value="pending">Pending</Option>
            <Option value="paid">Paid</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
          <RangePicker 
            style={{ marginRight: 16 }}
            onChange={handleDateChange}
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default PaymentList;
