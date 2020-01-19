#!/bin/sh
pkill -f 'gradle'

cd ../backend
gradle
gradle run --args='--global' > /dev/null 2>&1
cd ..
