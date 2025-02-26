@echo off

REM 在新視窗啟動 Vite 開發伺服器
start cmd /k "npm run dev"

REM 等待 Vite 啟動 (視情況調整時間)
timeout /t 5 /nobreak >nul

REM 自動打開瀏覽器訪問 Vite 預設的開發伺服器 (http://localhost:5173)
start chrome "http://localhost:5173"

REM 退出批次檔
exit