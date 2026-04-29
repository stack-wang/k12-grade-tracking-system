# K12 成绩追踪系统

为家长设计的 K12 阶段学生成绩管理工具，支持多科目成绩录入、趋势分析、强弱项诊断、成绩预警和 CSV 导出。

## 功能

- **成绩录入** — 按考试批量录入各科成绩，支持 upsert
- **趋势分析** — 各科目历次考试成绩变化曲线
- **强弱项诊断** — 自动计算各科平均分，排序展示优势科目和薄弱科目
- **成绩预警** — 连续两次下滑 ≥5% 或三次连降自动标记
- **CSV 导出** — 带 BOM 头的 CSV 文件，Excel 直接打开
- **打印报告** — 适合打印的成绩报告页面

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design 5 + Recharts |
| 后端 | Python 3.11 + FastAPI + SQLAlchemy 2.0 |
| 数据库 | SQLite（文件数据库，无需额外部署） |
| 认证 | JWT (HS256) + bcrypt |
| 部署 | Docker / docker-compose |

## 快速开始

### 本地开发

```bash
# 后端
cd backend
pip install -r requirements.txt
python main.py
# → http://localhost:8000  |  API 文档 /docs

# 前端
cd frontend
npm install
npm run dev
# → http://localhost:3000（自动代理 /api 到后端）
```

### Docker 部署

```bash
docker compose up --build
# → 前端 :80  |  后端 :8000
```

## 项目结构

```
├── backend/                # FastAPI 后端
│   ├── main.py             # 入口 + 路由注册
│   ├── config.py           # 配置（DATABASE_URL, SECRET_KEY 等）
│   ├── database.py         # SQLAlchemy 引擎 + Session
│   ├── dependencies.py     # JWT 认证依赖
│   ├── models/             # SQLAlchemy 表定义
│   ├── routers/            # 路由（auth, children, subjects, exams, scores, reports, exports）
│   ├── schemas/            # Pydantic 请求/响应模型
│   ├── services/           # 业务逻辑（报告、趋势、预警）
│   └── tests/              # pytest 测试
├── frontend/               # React 前端
│   ├── src/
│   │   ├── main.tsx        # 入口
│   │   ├── App.tsx         # 路由配置
│   │   ├── api/            # Axios 实例 + 拦截器
│   │   ├── context/        # AuthContext（JWT 状态管理）
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 通用组件
│   │   └── __tests__/      # Vitest 测试
│   └── vite.config.ts      # Vite 配置（含代理）
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── nginx.conf              # Nginx 反向代理配置
```

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./k12.db` | 数据库连接 |
| `SECRET_KEY` | **必填** | JWT 签名密钥（生产环境务必修改！） |
| `ALGORITHM` | `HS256` | JWT 算法 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (24h) | Token 过期时间 |

## 测试

```bash
# 后端
cd backend && pytest

# 前端
cd frontend && npm test
```

## 注意事项

- 默认**单孩子模式**：报告接口使用 `.first()` 取第一个孩子，多孩子需改造
- 数据库自动建表：`main.py` 启动时执行 `Base.metadata.create_all()`，无 migration
- 所有 UI 和 API 消息均为中文
- `SECRET_KEY` 硬编码有安全风险，已移除默认值，部署时必须通过环境变量设置
