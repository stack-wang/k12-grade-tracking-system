import { useEffect, useState } from 'react'
import { Card, Form, Input, Select, Button, message, Spin, Typography } from 'antd'
import api from '../api'

const { Title } = Typography

export default function ChildInfo() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [child, setChild] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadChild()
  }, [])

  const loadChild = async () => {
    try {
      const res = await api.get('/children')
      if (res.data.length > 0) {
        const c = res.data[0]
        setChild(c)
        form.setFieldsValue(c)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      if (child) {
        await api.put(`/children/${child.id}`, values)
        message.success('已更新')
      } else {
        await api.post('/children', values)
        message.success('已保存')
      }
      loadChild()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />

  return (
    <div>
      <Title level={4}>孩子信息</Title>
      <Card style={{ maxWidth: 500, width: '100%' }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
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
          <Button type="primary" htmlType="submit" loading={saving} block>
            保存
          </Button>
        </Form>
      </Card>
    </div>
  )
}
