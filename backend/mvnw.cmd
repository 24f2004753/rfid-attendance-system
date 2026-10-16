@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal

where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    mvn %*
    exit /b %ERRORLEVEL%
)

if exist "C:\Users\Archi\apache-maven-3.9.9\bin\mvn.cmd" (
    call "C:\Users\Archi\apache-maven-3.9.9\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)

echo [ERROR] Maven not found. Please install Apache Maven or ensure it is in your PATH.
exit /b 1

