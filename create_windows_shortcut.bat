@echo off
echo Creating Windows shortcut...

REM Create a direct shortcut to start.bat
powershell "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('Start Project.lnk'); $SC.TargetPath = '%~dp0start.bat'; $SC.WorkingDirectory = '%~dp0'; $SC.IconLocation = 'shell32.dll,13'; $SC.Save()"

echo Shortcut created! You can now double-click 'Start Project.lnk' to run your project.
pause 