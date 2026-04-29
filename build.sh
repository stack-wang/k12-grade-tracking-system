#!/bin/bash
set -e

echo "=== K12 成绩追踪系统 - Docker 构建 ==="

# 检查 Docker
if ! command -v docker &>/dev/null; then
  echo "错误：未找到 Docker，请先安装 Docker"
  exit 1
fi

# 检查 docker compose
if ! docker compose version &>/dev/null; then
  echo "错误：未找到 docker compose 插件"
  exit 1
fi

echo "1. 创建数据目录..."
mkdir -p data

echo "2. 构建镜像..."
docker compose build

echo ""
echo "=== 构建完成 ==="
echo ""
echo "启动服务：  docker compose up -d"
echo "停止服务：  docker compose down"
echo "查看日志：  docker compose logs -f"
echo ""
echo "访问地址："
echo "  前端： http://NAS_IP:80"
echo "  后端： http://NAS_IP:8000"
echo "  API文档： http://NAS_IP:8000/docs"
