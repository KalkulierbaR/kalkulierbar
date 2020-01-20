#!/bin/sh
pkill -f 'gradle'

cd ../backend || exit
./gradlew > /dev/null 2>&1
./gradlew run --args='--global' > /dev/null 2>&1
