#!/bin/sh
pkill -f 'gradle'

cd ../backend || exit
if [ -f './gradlew' ]
then
  ./gradlew > /dev/null 2>&1
  ./gradlew run --args='--global' > /dev/null 2>&1
elif [ -x "$(command -v gradle)" ]
  gradle && gradle run --args='--global' > /dev/null 2>&1
then
else
  echo 'ERROR: No Gradle wrapper or programm found. Please install Gradle first.'
fi
