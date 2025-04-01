@echo off
set count=0
set pid=%1
:loop1
tasklist /FI "PID eq %pid%" 2>NUL | find /I /N "electron.exe">NUL
if not "%ERRORLEVEL%"=="0" goto after_loop1
timeout /t 1
set /a count=count+1
if %count% equ 10 exit /b
goto loop1

:after_loop1
set filepath=%2

set names=
shift
:loop2
if "%2"=="" goto after_loop2
set names=%names% %2
shift
goto loop2

:after_loop2
for %%x in (%names%) do rmdir /s /q %filepath%%%x
