import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, DatePicker, Select, Card, Tag, Badge } from 'antd';
import { SearchOutlined, FilePdfOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({
    status: null,
    dateRange: null,
    search: '',
    isCorporate: null,
  });
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status,
        search: filters.search,
        isCorporate: filters.isCorporate,
      };
      
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await api.get('/drivers/invoices', { params });
      setInvoices(response.data.invoices);
      setPagination({
        ...pagination,
        total: response.data.count,
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
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

  const handleTypeChange = (value) => {
    setFilters({ ...filters, isCorporate: value });
    setPagination({ ...pagination, current: 1 });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'processing';
      case 'overdue': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.isCorporate && <Tag color="blue">Corporate</Tag>}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'issueDate',
      key: 'date',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>{record.customerId?.name || 'N/A'}</div>
          {record.isCorporate && record.companyDetails?.name && (
            <div className="text-xs text-gray-500">{record.companyDetails.name}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'amount',
      render: (amount) => `₹${amount?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={getStatusColor(status)} text={status.toUpperCase()} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => navigate(`/billing/invoices/${record._id}`)}
          >
            View
          </Button>
          <Button 
            type="text" 
            icon={<FilePdfOutlined />}
            onClick={() => window.open(`/api/invoices/${record._id}/pdf`, '_blank')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="invoice-list">
      <Card 
        title="Invoices" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/billing/invoices/new')}
          >
            New Invoice
          </Button>
        }
      >
        <div className="filters" style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by invoice # or customer"
            prefix={<SearchOutlined />}
            style={{ width: 250, marginRight: 16 }}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Filter by status"
            style={{ width: 150, marginRight: 16 }}
            allowClear
            onChange={handleStatusChange}
          >
            <Option value="draft">Draft</Option>
            <Option value="sent">Sent</Option>
            <Option value="paid">Paid</Option>
            <Option value="overdue">Overdue</Option>
          </Select>
          <Select
            placeholder="Filter by type"
            style={{ width: 150, marginRight: 16 }}
            allowClear
            onChange={handleTypeChange}
          >
            <Option value={true}>Corporate</Option>
            <Option value={false}>Individual</Option>
          </Select>
          <RangePicker 
            style={{ marginRight: 16 }}
            onChange={handleDateChange}
          />
        </div>
        
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default InvoiceList;
