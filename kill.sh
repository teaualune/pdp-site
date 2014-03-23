#!/bin/bash                                                                                                                    
id=$(ps aux | grep -ie 'python bg.py' | grep -v 'sudo' | awk '{print $2}' | xargs)
sudo kill -9 $id

ps aux | grep -ie 'node app' | awk '{print $2}' | xargs kill -9

