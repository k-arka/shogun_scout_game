@echo off
:: ============================================================
::  Shogun's Scout — Double-click launcher
::  Calls launch.ps1 with the right execution policy
:: ============================================================
title Shogun's Scout Launcher
PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1"
