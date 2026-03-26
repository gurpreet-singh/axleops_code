#!/bin/bash

# ==========================================
# AxleOps - Start Frontend and Backend
# ==========================================

echo "🚛 Starting AxleOps Services..."
echo ""

# 1. Start Backend (Spring Boot with H2 in-memory via Gradle)
echo "→ Starting Backend (Spring Boot on port 8080)..."
cd backend && ./gradlew bootRun -q &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "  Waiting for backend..."
sleep 8

# 2. Start Frontend (Vite)
echo "→ Starting Frontend (Vite on port 5173)..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

# Trap SIGINT (Ctrl+C) and kill background processes when stopping
trap "echo '⏹ Stopping services...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit" SIGINT SIGTERM

echo ""
echo "✅ Services running:"
echo "   Frontend → http://localhost:5173"
echo "   Backend  → http://localhost:8080/api/v1"
echo "   Swagger  → http://localhost:8080/api/v1/swagger-ui.html"
echo "   H2 DB    → http://localhost:8080/api/v1/h2-console"
echo ""
echo "Press Ctrl+C to stop all services."

# Wait for background processes
wait $FRONTEND_PID $BACKEND_PID
