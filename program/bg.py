import pymongo
import subprocess
import os
import time

client = pymongo.MongoClient("localhost", 27017)

db = client.pdp
print "python:" + db.name + " is connected"

subs = db.problemsubmissions
users = db.users
while(1):
	for item in subs.find({"state":0}):
		subs.update({"_id": item["_id"]}, {"$set": {"state":1}})

	for item in subs.find({"state":1}):
		print item["filePath"] + ' is executing'
		respond = os.popen("ls ./sandbox/").read()
		if (len(respond) > 0):
			os.popen("rm ./sandbox/*")
		
		os.popen("cp " + item["filePath"] + " ./sandbox/")
		os.popen("cp ./" + str(item['target']) + "/* ./sandbox")
		fileName = os.path.split(item["filePath"])
		os.chdir("./sandbox")

		#Compile Program
		respond1 = os.popen('./compile.sh ' + fileName[1]).read()
		
		#Launch Program
		tStart = time.time()
		respond2 = os.popen('./run.sh').read()
		tEnd = time.time()
		print (tEnd - tStart)
		os.chdir("../")
		subs.update({"_id": item["_id"]}, {"$set": {"state":2, "result":respond1 + respond2, "time":(tEnd - tStart)}})

