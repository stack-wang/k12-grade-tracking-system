import { useEffect, useState } from 'react'
import { Card, Select, InputNumber, Button, Table, message, Spin, Row, Col, Typography, Empty } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import api from '../api'

const { Title } = Typography

export default function ScoreEntry() {
  const [exams, setExams] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [child, setChild] = useState<any>(null)
  const [selectedExam, setSelectedExam] = useState<number | null>(null)
  const [scores, setScores] = useState<Record<number, { score: number; max_score: number }>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadExams()
    loadSubjects()
    loadChild()
  }, [])

  const loadExams = async () => {
    const res = await api.get('/exams')
    setExams(res.data)
  }

  const loadSubjects = async () => {
    const res = await api.get('/subjects')
    setSubjects(res.data)
  }

  const loadChild = async () => {
    const res = await api.get('/children')
    if (res.data.length > 0) setChild(res.data[0])
  }

  const loadScores = async (examId: number) => {
    setLoading(true)
    try {
      const res = await api.get('/scores', { params: { exam_id: examId } })
      const scoreMap: Record<number, { score: number; max_score: number }> = {}
      res.data.forEach((s: any) => {
        scoreMap[s.subject_id] = { score: s.score, max_score: s.max_score }
      })
      setScores(scoreMap)
    } finally {
      setLoading(false)
    }
  }

  const handleExamChange = (examId: number) => {
    setSelectedExam(examId)
    loadScores(examId)
  }

  const handleScoreChange = (subjectId: number, field: 'score' | 'max_score', value: number | null) => {
    setScores((prev) => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], [field]: value ?? 0 },
    }))
  }

  const handleSave = async () => {
    if (!selectedExam || !child) return
    setSaving(true)
    try {
      const scoreList = Object.entries(scores).map(([subjectId, data]) => ({
        child_id: child.id,
        subject_id: Number(subjectId),
        exam_id: selectedExam,
        score: data.score || 0,
        max_score: data.max_score || 100,
      }))
      await api.post('/scores/batch', { scores: scoreList })
      message.success('保存成功')
    } catch (err: any) {
      message.error(err.response?.data?.detail || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { title: '科目', dataIndex: 'name', key: 'name', width: 120 },
    {
      title: '得分',
      dataIndex: 'id',
      key: 'score',
      width: 150,
      render: (id: number) => (
        <InputNumber
          min={0}
          max={1000}
          value={scores[id]?.score}
          onChange={(v) => handleScoreChange(id, 'score', v)}
          style={{ width: 100 }}
          placeholder="得分"
        />
      ),
    },
    {
      title: '满分',
      dataIndex: 'id',
      key: 'max_score',
      width: 150,
      render: (id: number) => (
        <InputNumber
          min={1}
          max={1000}
          value={scores[id]?.max_score ?? 100}
          onChange={(v) => handleScoreChange(id, 'max_score', v)}
          style={{ width: 100 }}
          placeholder="满分"
        />
      ),
    },
    {
      title: '百分比',
      key: 'pct',
      render: (_: any, record: any) => {
        const s = scores[record.id]
        if (!s || !s.max_score) return '-'
        return `${s.score ?? 0} / ${s.max_score}`
      },
    },
  ]

  return (
    <div>
      <Title level={4}>成绩录入</Title>
      <Card>
        <Row gutter={[8, 8]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={8}>
            <Select
              placeholder="选择考试"
              style={{ width: '100%' }}
              value={selectedExam}
              onChange={handleExamChange}
              options={exams.map((e) => ({ label: `${e.name} (${e.exam_date})`, value: e.id }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving} disabled={!selectedExam} block>
              保存成绩
            </Button>
          </Col>
        </Row>

        {!selectedExam && <Empty description="请先选择考试" />}

        {selectedExam && (
          <Spin spinning={loading}>
            {subjects.length === 0 ? (
              <Empty description="请先在科目管理中设置科目" />
            ) : (
              <Table
                dataSource={subjects}
                rowKey="id"
                columns={columns}
                pagination={false}
                size="middle"
                scroll={{ x: 'max-content' }}
              />
            )}
          </Spin>
        )}
      </Card>
    </div>
  )
}
