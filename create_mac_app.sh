#!/bin/bash

# Make the script executable
chmod +x start.sh

# Compile the AppleScript into an application
osacompile -o "Start Project.app" "Start Project.applescript"

# Set the application icon (using a generic terminal icon)
cp /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/Terminal.icns "Start Project.app/Contents/Resources/applet.icns"

echo "Application created! You can now double-click 'Start Project.app' to run your project." 