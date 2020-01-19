#!/bin/sh
echo Please wait a moment

cd scripts
./backend.sh &
./frontend.sh
