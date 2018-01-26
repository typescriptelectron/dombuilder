class SpawnConsole extends Logpane{
    path:string

    constructor(id:string){
        super()
        this.id=id
        this.fromStored                
        ElectronGlobal.ipcRenderer.on(this.id, (event:any, data:any) => {	                        
            if(!data.spawn){
                this.log(new Logitem("Fatal: Could not start process. "+data.note,"error"))
            }else{
                if(data.error){
                    this.log(new Logitem(data.data.toString(),"error"))
                }else{
                    this.log(new Logitem(data.data.toString(),"success"))
                }
            }
        })
        this.filechooser=new Electron.FileChooser(this.id+"_path").setSelectedCallback(this.selectClicked.bind(this)).build()
    }
    fromJson(json:any):SpawnConsole{
        this.path=json.path
        return this
    }
    get toJsonText():string{
        return JSON.stringify(this,["id","path"],2)
    }
    pathClicked(e:Event){

    }
    command:TextInput
    issueClicked(e:Event){        
        let command=this.command.getTextAndClear()                
        this.log(new Logitem(command,"info"))
        ElectronGlobal.mainProcess.writeToProc(this.id,command)
        this.command.focusLater
    }    
    filechooser:Electron.FileChooser
    args:string[]=[]
    setArgs(args:string[]):SpawnConsole{
        this.args=args
        return this
    }
    spawn():SpawnConsole{
        ElectronGlobal.mainProcess.spawnProc(this.id,this.filechooser.path,this.args)        
        return this
    }
    selectClicked(e:Event){
        let path=this.filechooser.path        
    }
    spawnClicked(e:Event){
        this.spawn()
    }
    build():SpawnConsole{
        this.x.a([
            this.filechooser,
            this.command=new TextInput(this.id+"_command").setEnterCallback(this.issueClicked.bind(this)),
            new Button("Issue").onClick(this.issueClicked.bind(this)),
            new Button("Spawn").onClick(this.spawnClicked.bind(this)),
            this.createTable()
        ])
        this.command.focusLater
        return this
    }
    get activate():SpawnConsole{
        this.command.focusLater
        return this
    }
}