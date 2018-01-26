DEBUG=false

//localStorage.clear()

function resetApp(){
    localStorage.clear()
    buildApp()
}

function buildApp(){

    function sliderChanged(value:number){
        setRem(1+(value-50)/100)
    }

    let app=new Div()

    app.a([
        new Slider("scale").setRange(1,200,50).onChange(sliderChanged),
        new Button("Reset App").onClick(resetApp)
    ])

    let log=new Logpane()

    let project=new Project().
        setFields([
            new InputField("name","Project Name","CustomBuilder"),
            new InputField("dirname","Project Directory","custombuilder"),
            new InputField("description","Project Description","Build DOM using custom components."),
            new InputField("keywords","Project Description","build DOM using custom components"),
            new InputField("license","License","MIT"),
            new InputField("author","Author","Custom Maker"),            
            new InputField("githubuser","GitHub User","typescriptelectron"),
            new InputField("githubrepo","GitHub Repo","custombuilder"),
            new InputField("githubusermail","GitHub User Email","typescriptelectron@gmail.com"),
            new InputField("folders","Folders to Copy",".vscode,assets,dom,domelectron,utils"),
        ]).
        setStore(new DomStore("project").setDriver(new Electron.FileSystemDomStoreDriver())).
        build()

    let subtabpane=new Tabpane("subtabpane").
        setTabs([            
            new Tab("tab1","Tab1",new Div()),
            new Tab("tab2","Tab2",new Div())            
        ]).
        build()    

    let tabpane=(<Tabpane>new Tabpane("maintabpane").
        setTabs([
            new Tab("project","Project",project),
            new Tab("spawn","Spawn",new SpawnConsole("spawn").setArgs(["build.py"]).build()),            
            new Tab("gitbrowser","GitBrowser",new Electron.GitBrowser("gitbrowser").build()),            
            new Tab("app","App",app),
            new Tab("sub","Sub",subtabpane,false),
            new Tab("log","Log",log)            
        ]).
        snapToWindow()).
        build()    

    log.log(new Logitem("application started","info"))

    conslog=log.logText.bind(log)

    Layers.init()

    Layers.root.a([tabpane])

}

buildApp()

DEBUG=true