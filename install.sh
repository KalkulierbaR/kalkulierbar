echo "This will install Java v11.0.5 (optional), curl, Node.JS and yarn!"
echo " "
echo "Install Java? [y/n]"

read opt
	
#Install java (v11.0.5)
if [[ "$opt" == "y" ]]; then
sudo apt-get install openjdk-11-jre-headless
fi
#If input does not match neither y or no -> go to end
if [[ "$opt" != "y" && "$opt" != "n" ]]; then
exit 1
fi 

#Install curl
sudo apt-get install curl

#Install Node.JS (Ubuntu v13.3.0)
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential

#Install yarn (Ubuntu v1.21.1)
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn

