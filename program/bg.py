import pymongo
import subprocess
import os

client = pymongo.MongoClient("localhost", 27017)
db = client.pdp
db.name
subs = db.problemsubmissions
users = db.users

for item in subs.find({"state":0}):
	subs.update({"_id": item["_id"]}, {"$set": {"state":1}})

for item in subs.find({"state":1}):
	print item["filePath"]
	respond = os.popen("ls ./sandbox/").read()
	if (len(respond) > 0):
		os.popen("rm ./sandbox/*")

	os.popen("cp " + item["filePath"] + " ./sandbox/")
	os.popen("cp ./" + str(item['target']) + "/* ./sandbox")
	fileName = os.path.split(item["filePath"])
	os.chdir("./sandbox")
	respond = os.popen('./run.sh ' + fileName[1] + ' out').read()
	os.chdir("../")
	subs.update({"_id": item["_id"]}, {"$set": {"state":2, "result":respond}})	

