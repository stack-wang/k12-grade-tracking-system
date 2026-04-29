import { useState } from 'react'
import { Form, Input, Button, Card, Tabs, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', values)
      login(res.data.access_token, res.data.parent_name)
      message.success('登录成功')
      navigate('/')
    } catch (err: any) {
      message.error(err.response?.data?.detail || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (values: { username: string; password: string; name: string }) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', values)
      login(res.data.access_token, res.data.parent_name)
      message.success('注册成功')
      navigate('/')
    } catch (err: any) {
      message.error(err.response?.data?.detail || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: '100%', maxWidth: 400, margin: '0 16px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          K12 成绩追踪系统
        </Title>
        <Tabs
          centered
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form onFinish={onLogin} autoComplete="off">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    登录
                  </Button>
                </Form>
              ),
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form onFinish={onRegister} autoComplete="off">
                  <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                    <Input placeholder="您的姓名" />
                  </Form.Item>
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码', min: 6 }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码（至少6位）" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    注册
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
