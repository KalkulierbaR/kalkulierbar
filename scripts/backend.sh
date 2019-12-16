#!/bin/sh
pkill -f 'gradle'

cd ../backend
gradle
gradle run < /dev/null 2>&1
cd ..
