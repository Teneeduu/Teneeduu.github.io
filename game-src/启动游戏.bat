@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   黑洞吞噬 - 本地启动
echo   稍等几秒会自动打开浏览器
echo   地址: http://localhost:5173
echo   关闭游戏: 直接关掉这个黑色窗口
echo ============================================
rem 3 秒后自动打开浏览器（等服务器起来）
start "" cmd /c "timeout /t 3 >nul & start "" http://localhost:5173"
call npm run dev
pause
