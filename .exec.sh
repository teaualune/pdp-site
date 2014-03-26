#!/bin/bash


nohup node app >/dev/null 2>log &

cd ./program
if [ 'safe_mode' = 'safe_mode_config' ] ; then
	nohup sudo -u sandbox-test python bg.py >/dev/null 2>log &
else
	nohup python bg.py >/dev/null 2>log &
fi
cd ../

