import React, { useState } from 'react';
import { Card, Form, Input, Switch, Button, Space, message, Tabs, Divider, Select } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const SystemConfigPage: React.FC = () => {
  const [paymentForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [systemForm] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const handleSaveConfig = async (formType: string, values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`Cấu hình ${formType} đã được lưu thành công!`);
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu cấu hình!');
    } finally {
      setLoading(false);
    }
  };

  const paymentConfig = (
    <div style={{ padding: '16px' }}>
      <Card title="Cấu hình thanh toán" size="small">
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={(values) => handleSaveConfig('thanh toán', values)}
          initialValues={{
            vnpay_enabled: true,
            vnpay_merchant_id: 'VNPAY_MERCHANT_001',
            vnpay_secret_key: '*********************',
            momo_enabled: false,
            momo_partner_code: '',
            zalopay_enabled: true,
            zalopay_app_id: 'ZALO_APP_12345',
          }}
        >
          <h4>VNPay</h4>
          <Form.Item name="vnpay_enabled" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            <span style={{ marginLeft: '8px' }}>Kích hoạt VNPay</span>
          </Form.Item>
          
          <Form.Item name="vnpay_merchant_id" label="Merchant ID">
            <Input placeholder="Nhập Merchant ID" />
          </Form.Item>
          
          <Form.Item name="vnpay_secret_key" label="Secret Key">
            <Input.Password placeholder="Nhập Secret Key" />
          </Form.Item>

          <Divider />

          <h4>MoMo</h4>
          <Form.Item name="momo_enabled" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            <span style={{ marginLeft: '8px' }}>Kích hoạt MoMo</span>
          </Form.Item>
          
          <Form.Item name="momo_partner_code" label="Partner Code">
            <Input placeholder="Nhập Partner Code" />
          </Form.Item>

          <Divider />

          <h4>ZaloPay</h4>
          <Form.Item name="zalopay_enabled" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            <span style={{ marginLeft: '8px' }}>Kích hoạt ZaloPay</span>
          </Form.Item>
          
          <Form.Item name="zalopay_app_id" label="App ID">
            <Input placeholder="Nhập App ID" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Lưu cấu hình
              </Button>
              <Button icon={<ReloadOutlined />}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  const emailConfig = (
    <div style={{ padding: '16px' }}>
      <Card title="Cấu hình Email & SMS" size="small">
        <Form
          form={emailForm}
          layout="vertical"
          onFinish={(values) => handleSaveConfig('email', values)}
          initialValues={{
            smtp_enabled: true,
            smtp_host: 'smtp.gmail.com',
            smtp_port: 587,
            smtp_username: 'noreply@hotelsaas.com',
            sms_enabled: false,
            sms_provider: 'twilio',
          }}
        >
          <h4>SMTP Email</h4>
          <Form.Item name="smtp_enabled" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            <span style={{ marginLeft: '8px' }}>Kích hoạt gửi email</span>
          </Form.Item>
          
          <Form.Item name="smtp_host" label="SMTP Host">
            <Input placeholder="smtp.gmail.com" />
          </Form.Item>
          
          <Form.Item name="smtp_port" label="SMTP Port">
            <Input type="number" placeholder="587" />
          </Form.Item>
          
          <Form.Item name="smtp_username" label="Email gửi">
            <Input placeholder="noreply@hotelsaas.com" />
          </Form.Item>
          
          <Form.Item name="smtp_password" label="Mật khẩu">
            <Input.Password placeholder="Nhập mật khẩu email" />
          </Form.Item>

          <Divider />

          <h4>SMS</h4>
          <Form.Item name="sms_enabled" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            <span style={{ marginLeft: '8px' }}>Kích hoạt gửi SMS</span>
          </Form.Item>
          
          <Form.Item name="sms_provider" label="Nhà cung cấp SMS">
            <Select>
              <Option value="twilio">Twilio</Option>
              <Option value="nexmo">Nexmo</Option>
              <Option value="viettel">Viettel</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Lưu cấu hình
              </Button>
              <Button icon={<ReloadOutlined />}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  const securityConfig = (
    <div style={{ padding: '16px' }}>
      <Card title="Cấu hình bảo mật" size="small">
        <Form
          form={securityForm}
          layout="vertical"
          onFinish={(values) => handleSaveConfig('bảo mật', values)}
          initialValues={{
            two_factor_enabled: false,
            login_attempts: 5,
            session_timeout: 30,
            password_min_length: 8,
            password_require_special: true,
          }}
        >
          <Form.Item name="two_factor_enabled" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            <span style={{ marginLeft: '8px' }}>Xác thực 2 bước (2FA)</span>
          </Form.Item>
          
          <Form.Item name="login_attempts" label="Số lần đăng nhập sai tối đa">
            <Input type="number" placeholder="5" />
          </Form.Item>
          
          <Form.Item name="session_timeout" label="Thời gian hết hạn phiên (phút)">
            <Input type="number" placeholder="30" />
          </Form.Item>
          
          <Form.Item name="password_min_length" label="Độ dài mật khẩu tối thiểu">
            <Input type="number" placeholder="8" />
          </Form.Item>
          
          <Form.Item name="password_require_special" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            <span style={{ marginLeft: '8px' }}>Yêu cầu ký tự đặc biệt trong mật khẩu</span>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Lưu cấu hình
              </Button>
              <Button icon={<ReloadOutlined />}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  const systemConfig = (
    <div style={{ padding: '16px' }}>
      <Card title="Cấu hình hệ thống" size="small">
        <Form
          form={systemForm}
          layout="vertical"
          onFinish={(values) => handleSaveConfig('hệ thống', values)}
          initialValues={{
            system_name: 'Hotel SaaS Management',
            timezone: 'Asia/Ho_Chi_Minh',
            default_language: 'vi_VN',
            maintenance_mode: false,
            debug_mode: false,
          }}
        >
          <Form.Item name="system_name" label="Tên hệ thống">
            <Input placeholder="Hotel SaaS Management" />
          </Form.Item>
          
          <Form.Item name="timezone" label="Múi giờ">
            <Select>
              <Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</Option>
              <Option value="UTC">UTC (GMT+0)</Option>
              <Option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="default_language" label="Ngôn ngữ mặc định">
            <Select>
              <Option value="vi_VN">Tiếng Việt</Option>
              <Option value="en_US">English</Option>
              <Option value="zh_CN">中文</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="maintenance_mode" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            <span style={{ marginLeft: '8px' }}>Chế độ bảo trì</span>
          </Form.Item>
          
          <Form.Item name="debug_mode" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            <span style={{ marginLeft: '8px' }}>Chế độ debug</span>
          </Form.Item>

          <Form.Item name="backup_frequency" label="Tần suất sao lưu">
            <Select>
              <Option value="daily">Hằng ngày</Option>
              <Option value="weekly">Hằng tuần</Option>
              <Option value="monthly">Hằng tháng</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Lưu cấu hình
              </Button>
              <Button icon={<ReloadOutlined />}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  const items = [
    {
      key: 'payment',
      label: 'Thanh toán',
      children: paymentConfig,
    },
    {
      key: 'email',
      label: 'Email & SMS',
      children: emailConfig,
    },
    {
      key: 'security',
      label: 'Bảo mật',
      children: securityConfig,
    },
    {
      key: 'system',
      label: 'Hệ thống',
      children: systemConfig,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Cấu hình hệ thống">
        <Tabs defaultActiveKey="payment" items={items} />
      </Card>
    </div>
  );
};

export default SystemConfigPage;
