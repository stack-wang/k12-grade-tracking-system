import { useEffect, useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, DatePicker, Select, message, Space, Popconfirm, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../api'

const { Title } = Typography

export default function ExamList() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    setLoading(true)
    try {
      const res = await api.get('/exams')
      setExams(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      exam_date: values.exam_date.format('YYYY-MM-DD'),
      year: values.exam_date.year(),
    }
    try {
      if (editingExam) {
        await api.put(`/exams/${editingExam.id}`, data)
        message.success('已更新')
      } else {
        await api.post('/exams', data)
        message.success('已添加')
      }
      setModalOpen(false)
      setEditingExam(null)
      form.resetFields()
      loadExams()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/exams/${id}`)
      message.success('已删除')
      loadExams()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '删除失败')
    }
  }

  const openEdit = (exam: any) => {
    setEditingExam(exam)
    form.setFieldsValue({
      ...exam,
      exam_date: dayjs(exam.exam_date),
    })
    setModalOpen(true)
  }

  const columns = [
    { title: '考试名称', dataIndex: 'name', key: 'name' },
    { title: '考试日期', dataIndex: 'exam_date', key: 'exam_date' },
    { title: '学期', dataIndex: 'term', key: 'term' },
    { title: '年份', dataIndex: 'year', key: 'year' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>考试管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingExam(null)
            form.resetFields()
            setModalOpen(true)
          }}
        >
          新增考试
        </Button>
      </div>

      <Card>
        <Table dataSource={exams} rowKey="id" columns={columns} loading={loading} pagination={false} scroll={{ x: 'max-content' }} />
      </Card>

      <Modal
        title={editingExam ? '编辑考试' : '新增考试'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingExam(null) }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="考试名称" rules={[{ required: true }]}>
            <Input placeholder="如：期中考试" />
          </Form.Item>
          <Form.Item name="exam_date" label="考试日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="term" label="学期">
            <Select>
              <Select.Option value="上学期">上学期</Select.Option>
              <Select.Option value="下学期">下学期</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
