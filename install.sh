#!/bin/sh
echo "This will install curl, nodeJS and yarn"
echo " "

#If java installed then java_vers is not empty
java_vers=$(type -p java)

#Check if java is installed
if [ -z "$java_vers" ]; then
    echo "Java not found"
    echo "Please install java manually"
    exit 1
else
    echo "Java found on your system"
fi

#Check if curl is installed
if [ -x "$(command -v curl)" ]; then
  echo "Curl found on your system"
elif [ -x "$(command -v apt-get)" ]; then
  #Install curl
  sudo apt-get install curl
else
    echo 'Curl not found'
    echo "Please install curl manually"
    exit 1
fi

#Install Node.JS (Ubuntu v13.3.0)
curl https://nodejs.org/dist/v12.14.1/node-v12.14.1-linux-x64.tar.xz > node.tar.xz
sudo mkdir -p /usr/local/lib/nodejs
sudo tar -xJvf node.tar.xz -C /usr/local/lib/nodejs
rm node.tar.xz

#curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
#sudo apt-get install -y nodejs
#sudo apt-get install -y build-essential

#Install yarn (Ubuntu v1.21.1)
curl -o- -L https://yarnpkg.com/install.sh | bash
