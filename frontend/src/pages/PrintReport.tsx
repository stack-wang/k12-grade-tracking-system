import { useEffect, useState } from 'react'
import { Spin, Button, Typography, Tag } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import api from '../api'

const { Title, Text } = Typography

const gradeColors: Record<string, string> = { A: 'green', B: 'blue', C: 'orange', D: 'gold', F: 'red' }

export default function PrintReport() {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)
  const [child, setChild] = useState<any>(null)
  const [strengthData, setStrengthData] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [childRes, reportRes, swRes] = await Promise.all([
        api.get('/children'),
        api.get('/reports/full'),
        api.get('/reports/strength-weakness'),
      ])
      if (childRes.data.length > 0) setChild(childRes.data[0])
      setReport(reportRes.data)
      setStrengthData(swRes.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
  if (!report || report.error) return <div style={{ textAlign: 'center', marginTop: 100, color: '#999' }}>{report?.error || '暂无数据'}</div>

  const examNames = report.exams.map((e: any) => e.name)
  const tableData = report.subjects.map((s: any) => {
    const row: any = { subject: s.name }
    report.exams.forEach((e: any) => {
      const score = report.all_scores.find((sc: any) => sc.subject_id === s.id && sc.exam_id === e.id)
      row[e.name] = score ? `${score.score}/${score.max_score}` : '-'
    })
    return row
  })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div className="no-print" style={{ textAlign: 'right', marginBottom: 16 }}>
        <Button icon={<PrinterOutlined />} onClick={() => window.print()}>打印成绩单</Button>
      </div>

      <div id="print-area">
        <Title level={3} style={{ textAlign: 'center' }}>K12 成绩单</Title>
        {child && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Text>姓名：{child.name}</Text>
            <Text style={{ marginLeft: 24 }}>年级：{child.grade}</Text>
            <Text style={{ marginLeft: 24 }}>学校：{child.school_name}</Text>
          </div>
        )}

        {strengthData?.strengths?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>优势科目：</Text>
            {strengthData.strengths.map((s: any) => (
              <Tag color="green" key={s.subject_id} style={{ marginBottom: 4 }}>{s.subject_name} {s.average_percentage}分</Tag>
            ))}
            <br />
            <Text strong>薄弱科目：</Text>
            {strengthData.weaknesses.map((s: any) => (
              <Tag color="red" key={s.subject_id} style={{ marginBottom: 4 }}>{s.subject_name} {s.average_percentage}分</Tag>
            ))}
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th style={thStyle}>科目</th>
              {report.exams.map((e: any) => (
                <th key={e.id} style={thStyle}>{e.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.subjects.map((s: any) => {
              const row: any = { subject: s.name }
              return (
                <tr key={s.id}>
                  <td style={tdStyle}><b>{s.name}</b></td>
                  {report.exams.map((e: any) => {
                    const score = report.all_scores.find(
                      (sc: any) => sc.subject_id === s.id && sc.exam_id === e.id
                    )
                    return (
                      <td key={e.id} style={tdStyle}>
                        {score ? (
                          <span>
                            {score.score}/{score.max_score}
                            <Tag color={gradeColors[score.grade]} style={{ marginLeft: 4, fontSize: 11 }}>{score.grade}</Tag>
                          </span>
                        ) : '-'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>

        {report.exams.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Text strong>学期平均分趋势</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={thStyle}>考试</th>
                  {report.subjects.map((s: any) => (
                    <th key={s.id} style={thStyle}>{s.name}</th>
                  ))}
                  <th style={thStyle}>平均分</th>
                </tr>
              </thead>
              <tbody>
                {report.exams.map((e: any) => {
                  const scores = report.all_scores.filter((s: any) => s.exam_id === e.id)
                  const avg = scores.length > 0
                    ? Math.round(scores.reduce((sum: number, s: any) => sum + s.percentage, 0) / scores.length)
                    : 0
                  return (
                    <tr key={e.id}>
                      <td style={tdStyle}><b>{e.name}</b></td>
                      {report.subjects.map((s: any) => {
                        const sc = report.all_scores.find(
                          (se: any) => se.subject_id === s.id && se.exam_id === e.id
                        )
                        return <td key={s.id} style={tdStyle}>{sc ? `${sc.score}/${sc.max_score}` : '-'}</td>
                      })}
                      <td style={tdStyle}>{avg}分</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{printStyles}</style>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  border: '1px solid #d9d9d9',
  padding: '8px 12px',
  background: '#fafafa',
  textAlign: 'center',
  fontSize: 13,
}

const tdStyle: React.CSSProperties = {
  border: '1px solid #d9d9d9',
  padding: '8px 12px',
  textAlign: 'center',
  fontSize: 13,
}

const printStyles = `
  @media print {
    .no-print { display: none !important; }
    body { background: white; }
    #print-area { margin: 0; padding: 0; }
  }
`
