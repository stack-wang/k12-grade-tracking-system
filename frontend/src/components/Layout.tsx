import { ReactNode, useState, useEffect } from 'react'
import { Layout as AntLayout, Menu, Button, Typography, Modal, Form, Input, Select, message, Drawer, Grid } from 'antd'
import {
  DashboardOutlined,
  EditOutlined,
  OrderedListOutlined,
  BookOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const { Header, Sider, Content } = AntLayout
const { Text } = Typography
const { useBreakpoint } = Grid

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/score-entry', icon: <EditOutlined />, label: '成绩录入' },
  { key: '/exams', icon: <OrderedListOutlined />, label: '考试管理' },
  { key: '/subjects', icon: <BookOutlined />, label: '科目管理' },
  { key: '/reports', icon: <BarChartOutlined />, label: '成绩报表' },
  { key: '/child-info', icon: <UserOutlined />, label: '孩子信息' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { parentName, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [childInfo, setChildInfo] = useState<any>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [setupForm] = Form.useForm()
  const [pwModalOpen, setPwModalOpen] = useState(false)
  const [pwForm] = Form.useForm()
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    api.get('/children').then((res) => {
      if (res.data.length > 0) {
        setChildInfo(res.data[0])
      } else {
        setShowSetup(true)
      }
    })
  }, [])

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false)
  }, [isMobile])

  const handleChangePw = async (values: any) => {
    setPwLoading(true)
    try {
      await api.put('/auth/change-password', values)
      message.success('密码已修改')
      setPwModalOpen(false)
      pwForm.resetFields()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '修改失败')
    } finally {
      setPwLoading(false)
    }
  }

  const handleSetup = async (values: any) => {
    try {
      const res = await api.post('/children', values)
      setChildInfo(res.data)
      setShowSetup(false)
      message.success('孩子信息已保存')
    } catch (err: any) {
      message.error(err.response?.data?.detail || '保存失败')
    }
  }

  const onMenuClick = (key: string) => {
    navigate(key)
    if (isMobile) setDrawerOpen(false)
  }

  const sidebar = (
    <>
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong style={{ fontSize: isMobile ? 16 : collapsed ? 14 : 16, color: '#1677ff' }}>
          {isMobile || !collapsed ? 'K12 成绩追踪' : 'K12'}
        </Text>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => onMenuClick(key)}
        style={{ borderRight: 0 }}
      />
    </>
  )

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          title="K12 成绩追踪"
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          styles={{ body: { padding: 0 } }}
        >
          {sidebar}
        </Drawer>
      ) : (
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
          {sidebar}
        </Sider>
      )}

      <AntLayout>
        <Header style={{ background: '#fff', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', borderBottom: '1px solid #f0f0f0', gap: 8 }}>
          {isMobile && (
            <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            {childInfo && (
              <Text style={{ fontSize: 13 }} ellipsis>
                {childInfo.name} · {childInfo.grade}
              </Text>
            )}
            {!isMobile && <Text style={{ marginRight: 8 }}>{parentName}</Text>}
            {!isMobile && (
              <Button type="link" size="small" onClick={() => setPwModalOpen(true)} style={{ padding: '0 8px' }}>
                修改密码
              </Button>
            )}
            <Button type="text" size="small" icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/login') }}>
              {isMobile ? '' : '退出'}
            </Button>
          </div>
        </Header>
        <Content style={{ margin: isMobile ? 12 : 24 }}>
          {children}
        </Content>
      </AntLayout>

      <Modal
        title="初次使用 - 添加孩子信息"
        open={showSetup}
        closable={false}
        maskClosable={false}
        footer={null}
        width={isMobile ? '95%' : 520}
      >
        <Form form={setupForm} layout="vertical" onFinish={handleSetup}>
          <Form.Item name="name" label="孩子姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select>
              <Select.Option value="男">男</Select.Option>
              <Select.Option value="女">女</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="grade" label="年级">
            <Input placeholder="如：三年级、高一" />
          </Form.Item>
          <Form.Item name="school_name" label="学校">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            保存
          </Button>
        </Form>
      </Modal>

      <Modal
        title="修改密码"
        open={pwModalOpen}
        onCancel={() => { setPwModalOpen(false); pwForm.resetFields() }}
        onOk={() => pwForm.submit()}
        confirmLoading={pwLoading}
        width={isMobile ? '95%' : 400}
      >
        <Form form={pwForm} layout="vertical" onFinish={handleChangePw}>
          <Form.Item name="old_password" label="原密码" rules={[{ required: true, message: '请输入原密码' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="new_password" label="新密码" rules={[{ required: true, message: '请输入新密码', min: 6 }]}>
            <Input.Password placeholder="至少6位" />
          </Form.Item>
        </Form>
      </Modal>
    </AntLayout>
  )
}
