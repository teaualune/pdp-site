#Judge Configuration
mkdir ./program/sandbox
sudo useradd sandbox-test
sudo chown sandbox-test ./program/sandbox
sudo chgrp sandbox-test ./program/sandbox

#Website Configuration
mkdir upload
cd upload
mkdir hw hws problem ps
cd ../

#Nodejs Package Installation
npm install
npm install -g bower
bower install

