namespace Electron{
const fs=require("fs")
export class FileSystemDomStoreDriver{
    fileName(id:string):string{return id+".json"}
    store(id:string,content:any){        
        fs.writeFileSync(this.fileName(id),JSON.stringify(content))
    }
    retreive(id:string):any{                
        try{
            let content=fs.readFileSync(this.fileName(id),"utf8")            
            try{
                let json=JSON.parse(content)                
                return json
            }catch(err){
                if(DEBUG) console.log(err)
                return {}
            }
        }catch(err){
            if(DEBUG) console.log(err)
            return {}
        }
    }
}
}