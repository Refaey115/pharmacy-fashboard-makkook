@echo off
title Makkook Pharmacy Dashboard
echo.
echo  Starting Makkook Pharmacy Dashboard...
echo  Opening http://localhost:5173 in your browser
echo.
cd /d "%~dp0"
start "" "http://localhost:5173"
npm run dev
