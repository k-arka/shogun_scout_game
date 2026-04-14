@echo off
:: ============================================================
::  Shogun's Scout — Stop all game servers
:: ============================================================
title Shogun's Scout — Stopping...
echo.
echo  Stopping Shogun's Scout servers...
echo.

:: Kill processes on port 3000 (Next.js)
echo  [1/1] Stopping Next.js frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo  Done! Server has been stopped.
echo.
pause
