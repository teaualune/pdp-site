#!/bin/bash

#Judge Directory
mkdir ./program/sandbox
#Website Directories
mkdir upload
cd upload
mkdir hw hws problem ps
cd ../
cp ./.exec.sh ./exec.sh

echo "Do you want to config with sandbox-user?"
select yn in "Yes" "No"; do
	case $yn in
	Yes ) 
#Create judge sandbox user account
sudo useradd sandbox-test

#Make sandbox user can be loged in without password
if [ -f pdp_judge_user_config ] ; then
	sudo rm pdp_judge_user_config
fi
echo 'User_Alias PDP_JUDGE_COURSE = ' $(whoami) > pdp_judge_user_config
echo 'PDP_JUDGE_COURSE ALL = (sandbox-test) NOPASSWD: ALL' >> pdp_judge_user_config
chmod 440 ./pdp_judge_user_config
sudo chown root pdp_judge_user_config
sudo chgrp root pdp_judge_user_config
sudo chown sandbox-test ./program/sandbox
sudo chgrp sandbox-test ./program/sandbox
sudo mv ./pdp_judge_user_config /etc/sudoers.d/pdp_judge_user_config
		sed -i 's/safe_mode_config/safe_mode/g' ./exec.sh
		break;;
	No )
		sed -i 's/safe_mode_config/non_safe_mode/g' ./exec.sh
		break;;
	esac
done


