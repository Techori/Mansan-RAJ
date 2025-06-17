@echo off
echo Creating Windows application shortcut...

REM Create a VBS script to run the batch file
echo Set WshShell = CreateObject("WScript.Shell") > StartProject.vbs
echo strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) >> StartProject.vbs
echo WshShell.Run "cmd /c " ^& strPath ^& "\start.bat", 7, False >> StartProject.vbs

REM Create the shortcut
powershell "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('Start Project.lnk'); $SC.TargetPath = '%~dp0StartProject.vbs'; $SC.WorkingDirectory = '%~dp0'; $SC.IconLocation = 'shell32.dll,13'; $SC.Save()"

echo Windows application shortcut created! You can now double-click 'Start Project.lnk' to run your project.
pause 