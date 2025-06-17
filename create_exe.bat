@echo off
echo Creating Windows executable...

REM Create a temporary IExpress configuration file
echo [Version] > temp.sed
echo Class=IEXPRESS >> temp.sed
echo SEDVersion=3 >> temp.sed
echo [Options] >> temp.sed
echo PackagePurpose=InstallApp >> temp.sed
echo ShowInstallProgramWindow=0 >> temp.sed
echo HideExtractAnimation=1 >> temp.sed
echo UseLongFileName=1 >> temp.sed
echo InsideCompressed=0 >> temp.sed
echo CAB_FixedSize=0 >> temp.sed
echo CAB_ResvCodeSigning=0 >> temp.sed
echo RebootMode=N >> temp.sed
echo InstallPrompt=%InstallPrompt% >> temp.sed
echo DisplayLicense=%DisplayLicense% >> temp.sed
echo FinishMessage=%FinishMessage% >> temp.sed
echo TargetName=%TargetName% >> temp.sed
echo FriendlyName=%FriendlyName% >> temp.sed
echo AppLaunched=%AppLaunched% >> temp.sed
echo PostInstallCmd=%PostInstallCmd% >> temp.sed
echo AdminQuietInstCmd=%AdminQuietInstCmd% >> temp.sed
echo UserQuietInstCmd=%UserQuietInstCmd% >> temp.sed
echo SourceFiles=SourceFiles >> temp.sed
echo [Strings] >> temp.sed
echo InstallPrompt= >> temp.sed
echo DisplayLicense= >> temp.sed
echo FinishMessage= >> temp.sed
echo TargetName=Start Project.exe >> temp.sed
echo FriendlyName=Start Project >> temp.sed
echo AppLaunched=StartProject.vbs >> temp.sed
echo PostInstallCmd=<None> >> temp.sed
echo AdminQuietInstCmd= >> temp.sed
echo UserQuietInstCmd= >> temp.sed
echo FILE0="StartProject.vbs" >> temp.sed
echo [SourceFiles] >> temp.sed
echo SourceFiles0=. >> temp.sed
echo [SourceFiles0] >> temp.sed
echo %%FILE0%%= >> temp.sed

REM Create the executable using IExpress
iexpress /n /q temp.sed

REM Clean up
del temp.sed

echo Windows executable created! You can now double-click 'Start Project.exe' to run your project.
pause 