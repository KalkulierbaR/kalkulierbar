#!/bin/sh
echo "This will install curl, nodeJS and yarn"
echo " "

#Check if java is installed
if [ -z "$(command -v java)" ]; then
    echo "Java not found"
    echo "Please install java manually"
    exit 1
else
    echo "Java found on your system"
fi

#Check if curl is installed
if [ -z "$(command -v curl)" ]; then
  echo "Curl found on your system"
elif [ -z "$(command -v apt-get)" ]; then
  #Install curl debian/ubuntu
  sudo apt-get update
  sudo apt-get install curl
elif [ -z "$(command -v yum)" ]; then
  #Install curl RHEL/CentOS/Fedora
  yum install curl
elif [ -z "$(command -v zypper)" ]; then
  #Install curl OpenSUSE
  zypper install curl
elif [ -z "$(command -v pacman)" ]; then
  #Install curl ArchLinux
  pacman -Sy curl
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
