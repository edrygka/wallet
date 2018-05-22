#!/bin/sh

APP_NAME="client-linux-x64.bin" && TARGET="node$(node -v | awk '{ split($0,v,"."); print substr(v[1], 2) }')" && echo $APP_NAME && ./node_modules/.bin/pkg --targets $TARGET --output ./$APP_NAME ./package.json && mv ./$APP_NAME ./releases/linux &&
APP_NAME="client-macos-x64.bin" && TARGET="node$(node -v | awk '{ split($0,v,"."); print substr(v[1], 2) }')" && echo $APP_NAME && ./node_modules/.bin/pkg --targets $TARGET --output ./$APP_NAME ./package.json && mv ./$APP_NAME ./releases/osX &&
APP_NAME="client-windows-x86.exe" && TARGET="node$(node -v | awk '{ split($0,v,"."); print substr(v[1], 2) }')" && echo $APP_NAME && ./node_modules/.bin/pkg --targets $TARGET --output ./$APP_NAME ./package.json && mv ./$APP_NAME ./releases/windows