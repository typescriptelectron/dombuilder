namespace Electron{
export class GitBrowser extends DomElement<GitBrowser>{
    usercombo:ComboBox
    repocombo:ComboBox
    tokencombo:ComboBox

    users:string[]

    passwordtext:TextInput
    repotext:TextInput

    tokensById:{[id:string]:string}={}

    constructor(id:string){
        super("div")
        this.id=id
        this.fs(FONT_SIZE)
        this.fromStored
        ElectronGlobal.ipcRenderer.on(this.id, (event:any, data:any) => {
            
            console.log(data)

            if(data.action=="createrepo"){                
                this.resetRepo=null
                if(data.ok){                           
                    this.deleteDelToken()
                    this.listRepos()                    
                }
            }

            if(data.action=="deleterepo"){                                
                if(data.ok){                    
                    this.listRepos()
                }
            }

            if(data.action=="listrepos"){                
                if(data.ok){
                    let repos=data.result
                    this.repocombo.clear().addOptions(
                        repos.map((repo:any)=>new ComboOption(repo.name,repo.name))).
                        selectByIndex(0).build()
                    this.repocombo.selectByKey(this.latestCreateRepoName).build()
                    if(this.resetRepo!=null){
                        this.repotext.setText(this.resetRepo)
                        this.createRepo()
                    }
                }
            }           

            if(data.action=="createdeltoken"){                
                if(data.ok){
                    this.tokensById[data.result.id]=data.result.token
                    this.listDelTokens()
                }
            }

            if(data.action=="deletedeltoken"){                
                if(data.ok){                    
                    this.listDelTokens()
                }
            }

            if(data.action=="listdeltokens"){                
                if(data.ok){
                    let tokens=data.result.reverse()
                    this.tokencombo.clear().addOptions(
                        tokens.map((token:any)=>new ComboOption(token.id,`${token.id} ${token.note} ${token.scopes.join(",")} ${this.tokensById[token.id]}`))
                    ).selectByIndex(0).build()
                    if(this.resetRepo!=null){
                        this.deleteRepo()
                    }
                }
            }

        })
    }

    user:string|null
    password:string
    auth:any
    config:any

    scan(){
        this.user=this.usercombo.selectedKey
        this.password=this.passwordtext.getText()
        
        this.auth={
            username:this.user,
            password:this.password
        }

        this.config={
            auth:this.auth            
        }
    }

    gitApiRequest(action:string,url:string,method:string="get",data:any=null){
        this.scan()
        
        this.config.method=method

        let request:any={
            action:action,
            id:this.id,           
            url:url,
            config:this.config
        }

        if(data!=null){
            request.config.data=data
        }

        console.log("gitApiRequest",request)        

        ElectronGlobal.mainProcess.gitApiRequest(request)
    }

    adduserwindow:TextInputWindow

    gitUserAdded(){
        let user=this.adduserwindow.textinput.getText()
        this.usercombo.options.push(new ComboOption(user,user))        
        this.usercombo.selectByKey(user).build()
        this.usercombo.store
    }

    addUserClicked(e:Event){
        this.adduserwindow=<TextInputWindow>new TextInputWindow(this.id+"_addgituserwindow").
            setTitle("Add GitHub user").
            setInfo("Please enter a new GitHub user.").
            setOkCallback(this.gitUserAdded.bind(this)).
            build()
    }    

    listRepos(){
        this.gitApiRequest("listrepos","user/repos")
    }

    listReposClicked(e:Event){
        this.listRepos()
    }

    createDelToken(){
        let rnd=Math.floor(Math.random()*10000)
        let tokenName=`token_${rnd}`
        this.gitApiRequest("createdeltoken","authorizations","post",{
            scopes:["delete_repo"],
            note:tokenName
        })
    }

    createDelTokenClicked(e:Event){
        this.createDelToken()
    }

    deleteDelToken(){
        let authid=this.tokencombo.selectedKey
        this.gitApiRequest("deletedeltoken","authorizations/"+authid,"delete")
    }

    deleteDelTokenClicked(e:Event){
        this.deleteDelToken()
    }

    listDelTokens(){
        this.gitApiRequest("listdeltokens","authorizations")
    }

    listDelTokensClicked(e:Event){
        this.listDelTokens()
    }

    resetRepo:string|null=null

    resetRepoClicked(e:Event){
        let repo=this.repocombo.selectedKey
        this.resetRepo=repo
        this.createDelToken()        
    }

    deleteRepo(){
        let tokenid=this.tokencombo.selectedKey
        if(tokenid!=null){
            let token=this.tokensById[tokenid]
            if(token!=undefined){
                let user=this.usercombo.selectedKey
                let repo=this.repocombo.selectedKey
                let url="repos/"+user+"/"+repo+"?access_token="+token
                this.gitApiRequest("deleterepo",url,"delete")
            }
        }
    }

    deleteRepoClicked(e:Event){
        this.deleteRepo()
    }

    latestCreateRepoName:string=""

    createRepo(){
        let repoName=this.repotext.getText()
        if(repoName!=""){
            this.latestCreateRepoName=repoName
            this.gitApiRequest("createrepo","user/repos","post",{
                name:repoName
            })
        }
    }

    createRepoClicked(e:Event){        
        this.createRepo()
    }

    build():GitBrowser{
        this.usercombo=new ComboBox(this.id+"_usercombo").build()
        this.repocombo=new ComboBox(this.id+"_repocombo").clear().build()
        this.tokencombo=new ComboBox(this.id+"_tokencombo").clear().build()
        this.passwordtext=new TextInput(this.id+"_passwordtext",true)
        this.repotext=new TextInput(this.id+"_repotext")
        this.x.a([
            new Table().bs().a([
                new Tr().a([
                    new Td().h("Password:"),
                    new Td().a([
                        this.passwordtext
                    ])
                ]),
                new Tr().a([
                    new Td().a([
                        this.usercombo
                    ]),
                    new Td().a([
                        new Button("Add user").
                        onClick(this.addUserClicked.bind(this))
                    ])
                ]),
                new Tr().a([                    
                    new Td().a([
                        this.repotext
                    ]),
                    new Td().a([
                        new Button("Create repo").ok.
                        onClick(this.createRepoClicked.bind(this)),
                    ])
                ]),
                new Tr().a([
                    new Td().a([
                        this.repocombo
                    ]),
                    new Td().a([
                        new Button("List repos").ok.
                        onClick(this.listReposClicked.bind(this)),                        
                        new Button("Delete repo").cancel.
                        onClick(this.deleteRepoClicked.bind(this)),
                        new Button("Reset repo").cancel.
                        onClick(this.resetRepoClicked.bind(this))
                    ])
                ]),
                new Tr().a([                    
                    new Td().sa("colspan","2").a([
                        new Button("List del tokens").
                        onClick(this.listDelTokensClicked.bind(this)),
                        new Button("Create del token").
                        onClick(this.createDelTokenClicked.bind(this)),
                        new Button("Delete del token").
                        onClick(this.deleteDelTokenClicked.bind(this))
                    ])                    
                ]),
                new Tr().a([                    
                    new Td().sa("colspan","2").a([                        
                        this.tokencombo.w(400)
                    ])
                ])
            ])
        ])
        return this        
    }
}
}