@echo off
rem FocusLock installieren: startet Install.ps1 mit Administratorrechten.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell.exe -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0Install.ps1\"'"
