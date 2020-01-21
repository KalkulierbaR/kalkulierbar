#!/bin/sh
echo Please wait a moment

cd ./scripts || exit
./backend.sh &
./frontend.sh
