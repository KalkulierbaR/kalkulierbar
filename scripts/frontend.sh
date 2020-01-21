cd ../frontend || exit

if [ -x "$(command -v yarn)" ]; then
  yarn > /dev/null 2>&1
  yarn start
else
  echo 'ERROR: Yarn programm not found. Please make sure yarn is installed.'
fi