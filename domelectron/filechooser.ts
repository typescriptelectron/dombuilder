namespace Electron{
    export class FileChooser extends DomElement<FileChooser>{
        path:string=""
        title:string="Select"
        constructor(id:string){
            super("span")
            this.id=id
            this.fromStored                    
            ElectronGlobal.ipcRenderer.on(this.id, (event:any, data:any) => {				
                let path=data[0]
                this.path=path
                this.store
                if(this.selectedCallback!=undefined) this.selectedCallback()
            })
        }
        fromJson(json:any):FileChooser{
            this.path=json.path
            return this
        }
        get toJsonText():string{
            return JSON.stringify(this,["id","path"],2)
        }
        setTitle(title:string):FileChooser{
            this.title=title
            return this
        }
        selectButtonClicked(){
            ElectronGlobal.mainProcess.chooseFile(this.id,this.title)
        }
        selectedCallback:any
        setSelectedCallback(selectedCallback:any):FileChooser{
            this.selectedCallback=selectedCallback
            return this
        }
        build():FileChooser{
            this.x.a([
                new Button("...").onClick(this.selectButtonClicked.bind(this))
            ])            
            return this
        }
    }
}