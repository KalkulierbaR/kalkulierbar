cd ../frontend || exit

#Check for command node and export path
if [ -z "$(command -v node)" ]; then
  export PATH=/usr/local/lib/nodejs/node-v12.14.1-linux-x64/bin:$PATH
  . ~/.profile
fi

if [ "$(command -v npm)" ]; then
  npm i > /dev/null 2>&1
  npm run start
else
  echo 'ERROR: npm programm not found. Please make sure npm is installed.'
fi
