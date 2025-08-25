import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select, DatePicker, Card, Switch, Divider, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const PaymentForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isCorporate, setIsCorporate] = useState(false);
  const [booking, setBooking] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchPayment();
    }
  }, [id]);

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/drivers/payments/${id}`);
      const payment = response.data;
      form.setFieldsValue({
        ...payment,
        paymentDate: payment.paymentDate ? dayjs(payment.paymentDate) : undefined,
      });
      setIsCorporate(payment.isCorporate || false);
    } catch (error) {
      console.error('Error fetching payment:', error);
      message.error('Failed to load payment details');
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        paymentDate: values.paymentDate ? values.paymentDate.toISOString() : new Date().toISOString(),
        isCorporate,
      };

      if (isEdit) {
        await api.put(`/drivers/payments/${id}`, payload);
        message.success('Payment updated successfully');
      } else {
        await api.post('/drivers/payments/record', payload);
        message.success('Payment recorded successfully');
      }
      navigate('/billing/payments');
    } catch (error) {
      console.error('Error saving payment:', error);
      message.error(error.response?.data?.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSearch = async (value) => {
    if (!value) return;
    try {
      const response = await api.get(`/bookings/search?query=${value}`);
      setBooking(response.data);
      form.setFieldsValue({
        amount: response.data.fare,
        customerId: response.data.user._id,
      });
    } catch (error) {
      console.error('Error fetching booking:', error);
      message.error('Booking not found');
    }
  };

  return (
    <div className="payment-form">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back to Payments
      </Button>

      <Card title={isEdit ? 'Edit Payment' : 'Record New Payment'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            paymentMethod: 'cash',
            status: 'paid',
            paymentDate: dayjs(),
          }}
        >
          <Form.Item
            name="bookingId"
            label="Booking ID"
            rules={[{ required: true, message: 'Please select a booking' }]}
          >
            <Input.Search
              placeholder="Search booking by ID"
              onSearch={handleBookingSearch}
              enterButton
              disabled={isEdit}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Select>
                <Option value="cash">Cash</Option>
                <Option value="upi">UPI</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="paymentDate"
              label="Payment Date & Time"
              rules={[{ required: true, message: 'Please select payment date' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="paid">Paid</Option>
                <Option value="pending">Pending</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
          </div>

          <Divider orientation="left" style={{ margin: '24px 0' }}>
            <div className="flex items-center gap-2">
              <span>Corporate Billing</span>
              <Switch 
                checked={isCorporate} 
                onChange={setIsCorporate} 
                checkedChildren="Yes" 
                unCheckedChildren="No" 
              />
            </div>
          </Divider>

          {isCorporate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name={['corporateDetails', 'companyName']}
                label="Company Name"
                rules={[{ required: isCorporate, message: 'Company name is required' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={['corporateDetails', 'gstNumber']}
                label="GST Number"
                rules={[
                  { required: isCorporate, message: 'GST number is required' },
                  {
                    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                    message: 'Please enter a valid GST number',
                  },
                ]}
              >
                <Input placeholder="22AAAAA0000A1Z5" />
              </Form.Item>
              <Form.Item
                name={['corporateDetails', 'billingAddress']}
                label="Billing Address"
                rules={[{ required: isCorporate, message: 'Billing address is required' }]}
                className="md:col-span-2"
              >
                <TextArea rows={2} />
              </Form.Item>
            </div>
          )}

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Any additional notes about this payment" />
          </Form.Item>

          <div className="flex justify-end gap-4 mt-8">
            <Button onClick={() => navigate('/billing/payments')}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              {isEdit ? 'Update Payment' : 'Record Payment'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default PaymentForm;
