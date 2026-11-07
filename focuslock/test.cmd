@echo off
rem FocusLock TESTMODUS starten (kein Admin noetig, jederzeit schliessbar).
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0TestRun.ps1"
pause
