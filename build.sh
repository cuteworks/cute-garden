#!/bin/sh

# This script builds the SCSS, Typescript, and other static files from source.

clear

echo "CuteTemplate build started..."

echo "  Building stylesheets..."

if  [ ! -d static/css/bin ]
then
    mkdir -p static/css/bin
fi

sass --update src/scss:static/css/bin


echo "  Building TypeScript..."

if [ ! -d static/js/bin ]
then
    mkdir -p static/js/bin
fi

tsc

echo "-----------------------------------------------------------------------------------"
echo "Build complete - execute './build-run.sh' to start the server."
echo "-----------------------------------------------------------------------------------"
