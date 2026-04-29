import { useEffect, useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tag, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../api'

const { Title } = Typography

export default function SubjectSettings() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    setLoading(true)
    try {
      const res = await api.get('/subjects')
      setSubjects(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (values: { name: string }) => {
    try {
      await api.post('/subjects', values)
      message.success('科目已添加')
      setModalOpen(false)
      form.resetFields()
      loadSubjects()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '添加失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/subjects/${id}`)
      message.success('已删除')
      loadSubjects()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '删除失败')
    }
  }

  const colors = ['blue', 'green', 'orange', 'purple', 'cyan', 'pink', 'gold', 'lime']

  const columns = [
    {
      title: '科目',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, _: any, index: number) => (
        <Tag color={colors[index % colors.length]}>{name}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm title="确定删除？删除后相关成绩也会被清除" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>科目管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          添加科目
        </Button>
      </div>

      <Card>
        <Table dataSource={subjects} rowKey="id" columns={columns} loading={loading} pagination={false} scroll={{ x: 'max-content' }} />
      </Card>

      <Modal
        title="添加科目"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="name" label="科目名称" rules={[{ required: true, message: '请输入科目名称' }]}>
            <Input placeholder="如：语文、数学" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
