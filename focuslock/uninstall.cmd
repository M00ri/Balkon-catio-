@echo off
rem FocusLock entfernen: braucht Administratorrechte.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell.exe -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0Uninstall.ps1\"'"
