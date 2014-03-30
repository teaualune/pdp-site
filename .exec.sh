#!/bin/bash


#Please fill out the parameter by yourself to start mongodb
#nohup mongod --dbpath ~/db/ --bind_ip 127.0.0.1 >/dev/null 2>log &

nohup node app >/dev/null 2>log &

cd ./program
if [ 'safe_mode' = 'safe_mode_config' ] ; then
	nohup sudo -u sandbox-test python bg.py >/dev/null 2>log &
else
	nohup python bg.py >/dev/null 2>log &
fi
cd ../

