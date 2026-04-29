from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, children, subjects, exams, scores, reports, exports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="K12 成绩追踪系统")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(children.router)
app.include_router(subjects.router)
app.include_router(exams.router)
app.include_router(scores.router)
app.include_router(reports.router)
app.include_router(exports.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
