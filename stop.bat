@echo off
:: ============================================================
::  Shogun's Scout — Stop all game servers
:: ============================================================
title Shogun's Scout — Stopping...
echo.
echo  Stopping Shogun's Scout servers...
echo.

:: Kill processes on port 8000 (FastAPI)
echo  [1/2] Stopping FastAPI backend (port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Kill processes on port 3000 (Next.js)
echo  [2/2] Stopping Next.js frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo  Done! Both servers have been stopped.
echo.
pause
