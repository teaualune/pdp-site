import pymongo
import subprocess
import os
import time
import json

TIMEOUT = 60


def runTest(filePath, target):
	print filePath + ' is executing'
	respond = os.popen("ls ./sandbox/").read()
	if (len(respond) > 0):
		os.popen("rm ./sandbox/*")
	
	os.popen("cp " + filePath + " ./sandbox/")
	os.popen("cp ./problem_data/" + target + "/* ./sandbox")
	fileName = os.path.split(filePath)
	os.chdir("./sandbox")

	#Compile Program
	respond1 = os.popen('./compile.sh ' + fileName[1]).read()
	if (len(respond1) > 0):
		os.chdir("../")
		return ('WRONG FILE', 0)

	#Launch Program
	tStart = time.time()
	respond2 = os.popen('timeout -s 9 ' + str(TIMEOUT) + ' ./run.sh').read()
	tEnd = time.time()
	duration = (tEnd - tStart)
	if (respond2.find('Tests Completed') == -1):
		respond2 = 'Over Time!'
		duration = 0
	if (respond2.find('WRONG') >= 0):
		duration = 0
	
	duration = round(duration, 2)
	print 'End executing - ' + str(duration) + ' s'

	os.chdir("../")
	return (str(respond1) + str(respond2), duration)




client = pymongo.MongoClient("localhost", 27017)

db = client.pdp
print "python:" + db.name + " is connected"

subs = db.problemsubmissions
users = db.users
while(1):
	for item in subs.find({"state":0}):
		subs.update({"_id": item["_id"]}, {"$set": {"state":1}})

	for item in subs.find({"state":1}):
		subs.update({"_id": item["_id"]}, {"$set": {"state":2}})
		filePaths = item["filePaths"]

		timeRecord = item["times"]
		judgeHead = item["judgeHead"]

		counter = 0
		respond = ''
		print 'head ' + str(judgeHead)
		for filePath in filePaths:
			if (counter < judgeHead):
				counter += 1
				continue
			(respond, duration) = runTest(filePath, str(item['target']));
			timeRecord.append(duration)
			counter += 1

		subs.update({"_id": item["_id"]}, {"$set": {"times":timeRecord, "judgeHead":counter}})
		subs.update({"_id": item["_id"], "state":{"$gt": 0 }}, {"$set": {"state":3, "result":respond}})

