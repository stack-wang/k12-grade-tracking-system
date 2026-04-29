import { useEffect, useState } from 'react'
import { Card, Table, Typography, Spin, Row, Col, Empty, Select, Tag, Button, Space } from 'antd'
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts'
import api from '../api'

const { Title } = Typography
const colors = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#faad14']

export default function Reports() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [reportRes, trendsRes] = await Promise.all([
        api.get('/reports/full'),
        api.get('/reports/trends'),
      ])
      setReport(reportRes.data)
      setTrends(trendsRes.data || [])
      if (trendsRes.data?.length > 0) {
        setSelectedSubject(trendsRes.data[0].subject_id)
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />

  if (!report || report.error) {
    return <Empty description={report?.error || '暂无数据'} />
  }

  const gradeColors: Record<string, string> = { A: 'green', B: 'blue', C: 'orange', D: 'gold', F: 'red' }

  const examColumns = report.exams.map((e: any) => ({
    title: e.name,
    dataIndex: `exam_${e.id}`,
    key: `exam_${e.id}`,
    render: (v: any) =>
      v != null ? (
        <span>
          {v.score} / {v.max_score}{' '}
          <Tag color={gradeColors[v.grade] || 'default'} style={{ marginLeft: 4 }}>
            {v.grade}
          </Tag>
        </span>
      ) : (
        '-'
      ),
  }))

  const tableData = report.subjects.map((s: any) => {
    const row: any = { subject: s.name, key: s.id }
    report.exams.forEach((e: any) => {
      const score = report.all_scores.find(
        (sc: any) => sc.subject_id === s.id && sc.exam_id === e.id
      )
      row[`exam_${e.id}`] = score ? { score: score.score, max_score: score.max_score, grade: score.grade } : null
    })
    return row
  })

  // Radar data: latest exam
  const latestExam = report.exams[report.exams.length - 1]
  const radarData = latestExam
    ? report.subjects.map((s: any) => {
        const score = report.all_scores.find(
          (sc: any) => sc.subject_id === s.id && sc.exam_id === latestExam.id
        )
        return { subject: s.name, value: score ? score.percentage : 0, fullMark: 100 }
      })
    : []

  // Selected subject trend
  const selectedTrend = trends.find((t: any) => t.subject_id === selectedSubject)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>成绩报表</Title>
        <Space>
          <Button icon={<DownloadOutlined />} size="small" onClick={() => window.open('/api/exports/csv', '_blank')}>导出 CSV</Button>
          <Button icon={<PrinterOutlined />} size="small" onClick={() => navigate('/print')}>打印成绩单</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="各科成绩一览">
            <div style={{ overflowX: 'auto' }}>
              <Table
                dataSource={tableData}
                columns={[
                  { title: '科目', dataIndex: 'subject', key: 'subject', fixed: 'left', width: 100 },
                  ...examColumns,
                ]}
                pagination={false}
                size="small"
                bordered
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="各科趋势对比">
            {trends.length === 0 ? (
              <Empty description="暂无数据" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam_name" type="category" allowDuplicatedCategory={false} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {trends.map((t: any, i: number) => (
                    <Line
                      key={t.subject_id}
                      type="monotone"
                      data={t.trends}
                      dataKey="percentage"
                      name={t.subject_name}
                      stroke={colors[i % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="单科趋势分析">
            <Select
              style={{ width: '100%', marginBottom: 16, maxWidth: 280 }}
              value={selectedSubject}
              onChange={setSelectedSubject}
              options={trends.map((t: any) => ({ label: t.subject_name, value: t.subject_id }))}
            />
            {selectedTrend ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={selectedTrend.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam_name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="percentage" name="得分率" fill="#1677ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="请选择科目" />
            )}
          </Card>
        </Col>
      </Row>

      {radarData.length > 0 && latestExam && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title={`${latestExam.name} - 各科能力雷达图`}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="得分率" dataKey="value" stroke="#1677ff" fill="#1677ff" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
