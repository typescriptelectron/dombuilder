####################################

import os
import json
import shutil
import sys

####################################

PROJECTS_DIR="projects"
CONFIG_PATH="project.json"

####################################

def pf(x):
	print(x)
	sys.stdout.flush()

####################################

pf("-----------------------")
pf(sys.argv)
pf("-----------------------")

####################################

config={}

projectname="CustomBuilder"
projectdir="custombuilder"
projectdescription="Build DOM using custom components."
projectkeywords="build DOM using custom components"
projectlicense="MIT"
projectauthor="Custom Maker"
githubuser="typescriptelectron"
githubrepo="custombuilder"
githubusermail="typescriptelectron@gmail.com"

####################################

def projectdirpath():
	global PROJECTS_DIR
	global projectdir
	return PROJECTS_DIR+"/"+projectdir

def readconfig():
	pf("read config")
	global config
	global projectdir
	global projectname
	global projectdescription
	global projectkeywords
	global projectlicense
	global projectauthor
	global githubuser
	global githubrepo
	global githubusermail
	config=json.load(open(CONFIG_PATH))
	projectdir=config["dirname"]
	projectname=config["name"]
	projectdescription=config["description"]
	projectkeywords=config["keywords"]
	projectlicense=config["license"]
	projectauthor=config["author"]
	githubuser=config["githubuser"]
	githubrepo=config["githubrepo"]
	githubusermail=config["githubusermail"]

def githuburl():
	global githubuser
	global githubrepo
	return "https://github.com/"+githubuser+"/"+githubrepo

def buildpackagejson():		
	global githubusermail
	global projectname
	global projectdescription
	global projectkeywords
	global projectlicense
	global projectauthor
	pf("build package.json")
	packagejson=json.load(open("package.json"))
	gu=githuburl()
	pf("setting github url "+gu)
	packagejson["repository"]=gu
	pf("setting name "+projectname)
	packagejson["name"]=projectname
	pf("setting description "+projectdescription)
	packagejson["description"]=projectdescription
	pf("setting keywords "+projectkeywords)
	packagejson["keywords"]=projectkeywords
	pf("setting license "+projectlicense)
	packagejson["license"]=projectlicense
	pf("setting author "+projectauthor)
	packagejson["author"]=projectauthor
	packagejsonpath=projectdirpath()+"/package.json"
	pf("writing "+packagejsonpath)
	with open(packagejsonpath, 'w') as outfile:
		json.dump(packagejson, outfile, indent=2)

def buildgitconfig():
	global githubuser
	global githubusermail
	pf("build .gitconfig")
	gitconfig=open(".gitconfig").read()
	origgithuburl="https://github.com/typescriptelectron/dombuilder"
	gitconfig=gitconfig.replace(origgithuburl,githuburl())
	gitconfig=gitconfig.replace("name = typescriptelectron","name = "+githubuser)
	gitconfig=gitconfig.replace("email = typescriptelectron@gmail.com","email = "+githubusermail)
	gitconfig=gitconfig.replace("username = typescriptelectron","username = "+githubuser)
	gp=projectdirpath()+"/.gitconfig"
	pf("writing "+gp)
	open(gp,"w").write(gitconfig)

def buildreadme():
	global projectname
	global projectdescription
	pf("build readme")
	readme="# "+projectname+"\n\n"+projectdescription
	rp=projectdirpath()+"/Readme.md"
	pf("writing "+rp)
	open(rp,"w").write(readme)

def buildzbat():
	global projectdir
	pf("build z.bat")
	zbat="del {0:s}.7z\n".format(projectdir)
	zbat+="\"C:\\Program Files (x86)\\7-Zip\\7z.exe\" -t7z a {0:s}.7z .\\ -mx0 -xr!node_modules -xr!.git\n".format(projectdir)
	zbat+="pause\n"
	zp=projectdirpath()+"/z.bat"
	pf("writing "+zp)
	open(zp,"w").write(zbat)

def copyfolders():		
	global config
	for folder in config["folders"].split(","):
		pf("copying folder "+folder)
		shutil.copytree(folder,projectdirpath()+"/"+folder)

def copyfiles():
	pf("copy files")
	for file_name in os.listdir("."):
		full_file_name = os.path.join(".", file_name)
		if (os.path.isfile(full_file_name)):
			pf("copying "+file_name)
			shutil.copy(full_file_name, projectdirpath())

def removeprojectdir():
	pf("remove project directory")
	if os.path.exists(projectdirpath()):        
		pf("deleting "+projectdirpath())
		shutil.rmtree(projectdirpath())

def createprojectdir():
	pf("create project directroy")
	removeprojectdir()
	pf("creating "+projectdirpath())
	os.makedirs(projectdirpath())

def build():
	pf("build project")	
	readconfig()
	createprojectdir()
	copyfolders()
	copyfiles()
	buildpackagejson()
	buildgitconfig()
	buildreadme()
	buildzbat()

def remove():
	pf("remove project")	
	readconfig()	
	removeprojectdir()

####################################

################################################

MAX_ARGS = 10

################################################

ints = [None] * MAX_ARGS
floats = [None] * MAX_ARGS

def get_int(i,default):
	global ints
	if ints[i]==None:
		return default
	return ints[i]

def get_float(i,default):
	global floats
	if floats[i]==None:
		return default
	return floats[i]

################################################
# main loop

for linen in sys.stdin:	
	line=linen.rstrip()	
	parts=line.split(" ")
	command=parts[0]	
	if len(parts)>1:
		parts=parts[1:]
	else:
		parts=[]
	try:
		for i in range(MAX_ARGS):
			ints[i]=int(parts[i])
	except Exception:
		pass		
	try:
		for i in range(MAX_ARGS):
			floats[i]=float(parts[i])
	except Exception:
		pass		
	if command=="x":
		sys.exit("build terminated ok")
	elif command=="b":
		build()
	elif command=="d":
		remove()
	elif command=="h" or command=="help":
		pf("b - build")
		pf("d - delete")
	else:
		pf("unknown command: "+command)
