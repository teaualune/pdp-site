nohup node app &
cd ./program

#dummy operation for preventing the nohup take over the stdio and user can not enter password
sudo ls
nohup sudo -u sandbox-test python bg.py &

