import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Table, Tag, Space, Typography, Divider, Badge, message } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/drivers/invoices/${id}`);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      message.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setMarkingPaid(true);
      await api.post(`/drivers/invoices/${id}/pay`, {
        paymentDate: new Date().toISOString(),
        transactionId: `TRX-${Date.now()}`
      });
      message.success('Invoice marked as paid');
      fetchInvoice();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      message.error('Failed to update invoice status');
    } finally {
      setMarkingPaid(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge status="success" text="PAID" />;
      case 'overdue':
        return <Badge status="error" text="OVERDUE" />;
      case 'sent':
        return <Badge status="processing" text="SENT" />;
      default:
        return <Badge status="default" text={status?.toUpperCase() || 'DRAFT'} />;
    }
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span className="whitespace-pre-wrap">{text}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      align: 'right',
      render: (value) => `₹${value?.toFixed(2)}`,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (value) => `₹${value?.toFixed(2)}`,
    },
  ];

  if (loading || !invoice) {
    return <div>Loading...</div>;
  }

  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';
  const dueDate = invoice.dueDate ? dayjs(invoice.dueDate) : null;
  const isDue = dueDate && dueDate.isBefore(dayjs()) && !isPaid;

  return (
    <div className="invoice-view">
      <div className="flex justify-between items-center mb-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
        >
          Back to Invoices
        </Button>
        
        <Space>
          {!isPaid && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={handleMarkAsPaid}
              loading={markingPaid}
            >
              Mark as Paid
            </Button>
          )}
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            Print
          </Button>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => window.open(`/api/invoices/${id}/pdf`, '_blank')}
          >
            Download PDF
          </Button>
        </Space>
      </div>

      <Card className="mb-6 print:shadow-none print:border-0">
        <div className="flex justify-between items-start mb-8">
          <div>
            <Title level={3} className="mb-0">
              {invoice.isCorporate ? 'TAX INVOICE' : 'INVOICE'}
            </Title>
            <Text type="secondary">#{invoice.invoiceNumber}</Text>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold">
              {getStatusBadge(isDue ? 'overdue' : invoice.status)}
            </div>
            <div className="text-sm text-gray-500">
              Issued: {dayjs(invoice.issueDate).format('DD MMM YYYY')}
            </div>
            {dueDate && (
              <div className={`text-sm ${isDue ? 'text-red-500' : 'text-gray-500'}`}>
                {isPaid ? 'Paid on: ' : 'Due: '} 
                {dayjs(dueDate).format('DD MMM YYYY')}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">BILL TO</div>
            {invoice.isCorporate ? (
              <div className="space-y-1">
                <div className="font-medium">{invoice.companyDetails?.name}</div>
                <div>{invoice.companyDetails?.contactPerson}</div>
                <div className="whitespace-pre-line">{invoice.companyDetails?.address}</div>
                <div>GST: {invoice.companyDetails?.gstNumber}</div>
                <div>Email: {invoice.companyDetails?.contactEmail}</div>
                <div>Phone: {invoice.companyDetails?.contactPhone}</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-medium">{invoice.customerId?.name}</div>
                <div>Email: {invoice.customerId?.email || 'N/A'}</div>
                <div>Phone: {invoice.customerId?.phone || 'N/A'}</div>
              </div>
            )}
          </div>
          
          <div className="md:text-right">
            <div className="text-sm font-medium text-gray-500 mb-2">PAYMENT DETAILS</div>
            <div className="space-y-1">
              <div>Payment Method: {invoice.paymentMethod?.toUpperCase() || 'N/A'}</div>
              {isPaid && invoice.paymentDate && (
                <div>Paid on: {dayjs(invoice.paymentDate).format('DD MMM YYYY')}</div>
              )}
              {invoice.transactionId && (
                <div>Transaction ID: {invoice.transactionId}</div>
              )}
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={invoice.items}
          rowKey="_id"
          pagination={false}
          className="mb-6"
        />

        <div className="ml-auto" style={{ maxWidth: '300px' }}>
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>₹{invoice.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>GST (18%):</span>
            <span>₹{invoice.taxAmount?.toFixed(2)}</span>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>₹{invoice.total?.toFixed(2)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-4 border-t">
            <div className="text-sm font-medium text-gray-500 mb-2">NOTES</div>
            <div className="whitespace-pre-wrap">{invoice.notes}</div>
          </div>
        )}
      </Card>

      <div className="print:hidden text-center text-gray-500 text-sm mt-8">
        Thank you for your business!
      </div>
    </div>
  );
};

export default InvoiceView;
