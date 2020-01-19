#!/bin/sh
pkill -f 'gradle'

cd ../backend
./gradlew > /dev/null 2>&1
./gradlew run --args='--global' > /dev/null 2>&1
cd ..
