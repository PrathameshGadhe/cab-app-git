import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, DatePicker, Card, Switch, Divider, message, Table, Space, Typography } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const InvoiceForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isCorporate, setIsCorporate] = useState(false);
  const [booking, setBooking] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchInvoice();
    } else {
      form.setFieldsValue({
        issueDate: dayjs(),
        items: [{
          description: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0
        }]
      });
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/drivers/invoices/${id}`);
      const invoice = response.data;
      
      form.setFieldsValue({
        ...invoice,
        issueDate: invoice.issueDate ? dayjs(invoice.issueDate) : undefined,
        dueDate: invoice.dueDate ? dayjs(invoice.dueDate) : undefined,
      });
      
      setIsCorporate(invoice.isCorporate || false);
      setBooking(invoice.bookingId);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      message.error('Failed to load invoice details');
    }
  };

  const calculateTotals = (items) => {
    if (!items) return { subtotal: 0, taxAmount: 0, total: 0 };
    
    const subtotal = items.reduce((sum, item) => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      return sum + (quantity * unitPrice);
    }, 0);
    
    const taxRate = 0.18; // 18% GST
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const updateAmounts = () => {
    const items = form.getFieldValue('items') || [];
    const updatedItems = items.map(item => ({
      ...item,
      amount: (item.quantity || 0) * (item.unitPrice || 0)
    }));
    
    form.setFieldsValue({ items: updatedItems });
    return updatedItems;
  };

  const onValuesChange = (changedValues, allValues) => {
    if (changedValues.items) {
      const updatedItems = updateAmounts();
      const { subtotal, taxAmount, total } = calculateTotals(updatedItems);
      form.setFieldsValue({ subtotal, taxAmount, total });
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        issueDate: values.issueDate.toISOString(),
        dueDate: values.dueDate?.toISOString(),
        isCorporate,
        items: values.items.map(item => ({
          ...item,
          amount: (item.quantity || 0) * (item.unitPrice || 0)
        }))
      };

      if (isEdit) {
        await api.put(`/drivers/invoices/${id}`, payload);
        message.success('Invoice updated successfully');
      } else {
        await api.post('/drivers/invoices', payload);
        message.success('Invoice created successfully');
      }
      navigate('/billing/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      message.error(error.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSearch = async (value) => {
    if (!value) return;
    try {
      const response = await api.get(`/bookings/search?query=${value}`);
      const booking = response.data;
      setBooking(booking);
      
      form.setFieldsValue({
        customerId: booking.user._id,
        items: [{
          description: `Trip from ${booking.pickupLocation} to ${booking.dropoffLocation}`,
          quantity: 1,
          unitPrice: booking.fare,
          amount: booking.fare
        }]
      });
      
      updateAmounts();
    } catch (error) {
      console.error('Error fetching booking:', error);
      message.error('Booking not found');
    }
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'description']}
          style={{ margin: 0 }}
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
        </Form.Item>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'quantity']}
          style={{ margin: 0 }}
          rules={[{ required: true, message: 'Required' }]}
        >
          <InputNumber 
            min={1} 
            style={{ width: '100%' }} 
            onChange={() => updateAmounts()}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 150,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'unitPrice']}
          style={{ margin: 0 }}
          rules={[{ required: true, message: 'Required' }]}
        >
          <InputNumber 
            min={0} 
            step={0.01} 
            style={{ width: '100%' }} 
            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/₹\s?|(,*)/g, '')}
            onChange={() => updateAmounts()}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (_, record, index) => (
        <Form.Item
          name={['items', index, 'amount']}
          style={{ margin: 0 }}
        >
          <InputNumber 
            readOnly 
            style={{ width: '100%', backgroundColor: '#f5f5f5' }} 
            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/₹\s?|(,*)/g, '')}
          />
        </Form.Item>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_, __, index) => (
        <Form.Item style={{ margin: 0 }}>
          <MinusCircleOutlined
            onClick={() => {
              const items = form.getFieldValue('items');
              if (items.length > 1) {
                form.setFieldsValue({
                  items: items.filter((_, i) => i !== index)
                });
                updateAmounts();
              }
            }}
            style={{ color: '#ff4d4f', fontSize: '16px' }}
          />
        </Form.Item>
      ),
    },
  ];

  const addNewRow = () => {
    const items = form.getFieldValue('items') || [];
    form.setFieldsValue({
      items: [...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    });
  };

  return (
    <div className="invoice-form">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back to Invoices
      </Button>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        initialValues={{
          status: 'draft',
          paymentMethod: 'bank_transfer',
        }}
      >
        <Card 
          title={
            <div className="flex justify-between items-center">
              <span>{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</span>
              <div className="flex items-center gap-4">
                <Form.Item name="status" noStyle>
                  <Select style={{ width: 120 }}>
                    <Option value="draft">Draft</Option>
                    <Option value="sent">Sent</Option>
                    {isEdit && <Option value="paid">Paid</Option>}
                  </Select>
                </Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  {isEdit ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Form.Item
                name="bookingId"
                label="Booking ID"
                rules={[{ required: !isEdit, message: 'Please select a booking' }]}
              >
                <Input.Search
                  placeholder="Search booking by ID"
                  onSearch={handleBookingSearch}
                  enterButton
                  disabled={isEdit}
                />
              </Form.Item>

              {booking && (
                <div className="mb-6 p-4 border rounded bg-gray-50">
                  <div className="font-medium">Booking Details:</div>
                  <div>From: {booking.pickupLocation}</div>
                  <div>To: {booking.dropoffLocation}</div>
                  <div>Fare: ₹{booking.fare?.toFixed(2)}</div>
                </div>
              )}

              <Form.Item
                name="issueDate"
                label="Issue Date"
                rules={[{ required: true, message: 'Please select issue date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: isCorporate, message: 'Please select due date' }]}
              >
                <DatePicker style={{ width: '100%' }} disabled={!isCorporate} />
              </Form.Item>

              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{ required: true, message: 'Please select payment method' }]}
              >
                <Select>
                  <Option value="bank_transfer">Bank Transfer</Option>
                  <Option value="upi">UPI</Option>
                  <Option value="cash">Cash</Option>
                </Select>
              </Form.Item>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Title level={5} style={{ margin: 0 }}>Billing Details</Title>
                <div className="flex items-center gap-2">
                  <span>Corporate</span>
                  <Switch 
                    checked={isCorporate} 
                    onChange={setIsCorporate} 
                    disabled={isEdit}
                  />
                </div>
              </div>

              {isCorporate ? (
                <div className="space-y-4">
                  <Form.Item
                    name={['companyDetails', 'name']}
                    label="Company Name"
                    rules={[{ required: true, message: 'Company name is required' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={['companyDetails', 'gstNumber']}
                    label="GST Number"
                    rules={[
                      { required: true, message: 'GST number is required' },
                      {
                        pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                        message: 'Please enter a valid GST number',
                      },
                    ]}
                  >
                    <Input placeholder="22AAAAA0000A1Z5" />
                  </Form.Item>
                  <Form.Item
                    name={['companyDetails', 'address']}
                    label="Billing Address"
                    rules={[{ required: true, message: 'Billing address is required' }]}
                  >
                    <TextArea rows={2} />
                  </Form.Item>
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name={['companyDetails', 'contactPerson']}
                      label="Contact Person"
                      rules={[{ required: true, message: 'Contact person is required' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name={['companyDetails', 'contactEmail']}
                      label="Contact Email"
                      rules={[
                        { required: true, message: 'Contact email is required' },
                        { type: 'email', message: 'Please enter a valid email' },
                      ]}
                    >
                      <Input type="email" />
                    </Form.Item>
                    <Form.Item
                      name={['companyDetails', 'contactPhone']}
                      label="Contact Phone"
                      rules={[
                        { required: true, message: 'Contact phone is required' },
                        {
                          pattern: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit phone number',
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded bg-gray-50">
                  <div className="text-gray-600 mb-2">Customer Details:</div>
                  {booking?.user ? (
                    <div>
                      <div>{booking.user.name}</div>
                      <div>{booking.user.email}</div>
                      <div>{booking.user.phone}</div>
                    </div>
                  ) : (
                    <div className="text-gray-400">Select a booking to see customer details</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Divider>Items</Divider>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <Table
                  columns={columns}
                  dataSource={fields}
                  rowKey="key"
                  pagination={false}
                  footer={() => (
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Item
                    </Button>
                  )}
                />
              </>
            )}
          </Form.List>

          <div className="mt-8 ml-auto" style={{ maxWidth: '300px' }}>
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <Form.Item name="subtotal" noStyle>
                <InputNumber 
                  readOnly 
                  bordered={false}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  className="text-right w-32"
                />
              </Form.Item>
            </div>
            <div className="flex justify-between mb-2">
              <span>GST (18%):</span>
              <Form.Item name="taxAmount" noStyle>
                <InputNumber 
                  readOnly 
                  bordered={false}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  className="text-right w-32"
                />
              </Form.Item>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <Form.Item name="total" noStyle>
                <InputNumber 
                  readOnly 
                  bordered={false}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  className="text-right w-32 text-lg font-semibold"
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="notes"
            label="Notes"
            className="mt-8"
          >
            <TextArea rows={3} placeholder="Any additional notes about this invoice" />
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};

export default InvoiceForm;
