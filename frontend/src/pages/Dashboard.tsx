import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Typography, Spin, Tag, Alert, Button } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, BookOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalExams: 0, totalSubjects: 0, totalScores: 0 })
  const [recentScores, setRecentScores] = useState<any[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [latestAvg, setLatestAvg] = useState<any>(null)
  const [prevAvg, setPrevAvg] = useState<any>(null)
  const [warnings, setWarnings] = useState<any[]>([])
  const [strengthData, setStrengthData] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [examsRes, subjectsRes, reportRes, trendsRes, warningsRes, swRes] = await Promise.all([
        api.get('/exams'),
        api.get('/subjects'),
        api.get('/reports/full'),
        api.get('/reports/trends'),
        api.get('/reports/warnings'),
        api.get('/reports/strength-weakness'),
      ])

      const exams = examsRes.data
      const subjects = subjectsRes.data
      setWarnings(warningsRes.data || [])
      setStrengthData(swRes.data || null)
      const allScores = reportRes.data?.all_scores || []
      const trendsData = trendsRes.data || []

      setStats({
        totalExams: exams.length,
        totalSubjects: subjects.length,
        totalScores: allScores.length,
      })

      // Latest scores per subject
      const latestPerSubject: any = {}
      allScores.forEach((s: any) => {
        if (!latestPerSubject[s.subject_name] || s.exam_date > latestPerSubject[s.subject_name].exam_date) {
          latestPerSubject[s.subject_name] = s
        }
      })
      setRecentScores(Object.values(latestPerSubject))

      // Average trend
      if (trendsData.length > 0) {
        setTrends(trendsData)
        const examAverages: any = {}
        allScores.forEach((s: any) => {
          if (!examAverages[s.exam_name]) examAverages[s.exam_name] = { totalScore: 0, totalMax: 0, count: 0, date: s.exam_date }
          examAverages[s.exam_name].totalScore += s.score
          examAverages[s.exam_name].totalMax += s.max_score
          examAverages[s.exam_name].count += 1
        })
        const avgArr = Object.entries(examAverages)
          .map(([name, d]: any) => ({
            name,
            avgScore: Math.round(d.totalScore / d.count),
            avgMax: Math.round(d.totalMax / d.count),
            date: d.date,
          }))
          .sort((a, b) => a.date.localeCompare(b.date))

        if (avgArr.length >= 2) {
          setLatestAvg(avgArr[avgArr.length - 1])
          setPrevAvg(avgArr[avgArr.length - 2])
        } else if (avgArr.length === 1) {
          setLatestAvg(avgArr[0])
        }
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const colors = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2', '#faad14']

  const handleExport = () => {
    window.open('/api/exports/csv', '_blank')
  }

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 12 }}>
        <Button icon={<DownloadOutlined />} size="small" onClick={handleExport}>导出 CSV</Button>
      </div>
      {warnings.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message="成绩预警"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {warnings.map((w, i) => (
                <li key={i}>
                  {w.subject_name}：{w.type === 'consecutive_drop' ? '连续' : ''}下滑{' '}
                  <strong>{w.drop}分</strong>（{w.previous_exam}: {w.previous_percentage}分 → {w.latest_exam}: {w.latest_percentage}分）
                </li>
              ))}
            </ul>
          }
          style={{ marginBottom: 16 }}
        />
      )}
      {strengthData && strengthData.strengths?.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="优势科目" size="small">
              {strengthData.strengths.map((s: any) => (
                <Tag color="green" style={{ marginBottom: 4 }} key={s.subject_id}>
                  {s.subject_name} {s.average_percentage}分
                </Tag>
              ))}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="薄弱科目" size="small">
              {strengthData.weaknesses.map((s: any) => (
                <Tag color="red" style={{ marginBottom: 4 }} key={s.subject_id}>
                  {s.subject_name} {s.average_percentage}分
                </Tag>
              ))}
            </Card>
          </Col>
        </Row>
      )}
      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <Card onClick={() => navigate('/exams')} style={{ cursor: 'pointer' }}>
            <Statistic title="考试次数" value={stats.totalExams} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card onClick={() => navigate('/subjects')} style={{ cursor: 'pointer' }}>
            <Statistic title="科目数量" value={stats.totalSubjects} prefix={<BookOutlined />} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="最近平均分"
              value={latestAvg?.avgScore ?? 0}
              suffix={<span> / {latestAvg?.avgMax ?? 100}</span>}
              valueStyle={{ color: latestAvg && prevAvg && latestAvg.avgScore >= prevAvg.avgScore ? '#52c41a' : '#ff4d4f' }}
              prefix={latestAvg && prevAvg && latestAvg.avgScore >= prevAvg.avgScore ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="成绩记录数" value={stats.totalScores} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="各科最新成绩">
            {recentScores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>暂无数据，请先录入成绩</div>
            ) : (
              <Table
                dataSource={recentScores}
                rowKey="subject_id"
                pagination={false}
                size="small"
                columns={[
                  { title: '科目', dataIndex: 'subject_name' },
                  {
                    title: '分数',
                    dataIndex: 'score',
                    render: (v: number, r: any) => `${v} / ${r.max_score}`,
                  },
                  {
                    title: '等级',
                    dataIndex: 'grade',
                    render: (v: string) => {
                      const colors: Record<string, string> = { A: 'green', B: 'blue', C: 'orange', D: 'gold', F: 'red' }
                      return <Tag color={colors[v] || 'default'}>{v}</Tag>
                    },
                  },
                  { title: '考试', dataIndex: 'exam_name' },
                ]}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="总平均分趋势">
            {trends.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>暂无数据</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trends[0]?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exam_name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
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
      </Row>
    </div>
  )
}
