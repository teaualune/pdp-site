ps aux | grep -ie 'python bg.py' | awk '{print $2}' | xargs kill -9
ps aux | grep -ie 'node app' | awk '{print $2}' | xargs kill -9

