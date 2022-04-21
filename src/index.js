const express=require('express')
const cheerio=require('cheerio');
const {fetch}=require('./lib/util')
const PORT=4000;
const {webs,extractInfor}=require('./db.js');
//


const app=express();
app.use(express.static("public"))
app.set('view engine',"ejs");
app.set('views','./views');
app.listen(PORT);



app.get("/",(req,res)=>{
    res.render("index");
})
const _URL_MONITOR="https://shopee.vn"
app.get("/api/search",(req,res)=>{
    const keys=(req.query['q']).trim().split(/[,. :;+]/g);
    console.log("001. input '%s'",keys.join(" "))
    const alls=webs.map((web,_pos)=>{
        let _host=web.root+web.search+keys.join(web.delimiter);
        if(web.search2&&web.delimiter2) _host+=web.search2+keys.join(web.delimiter2)
        console.log("%s. fetch '%s'",_pos,_host)
        return fetch(_host,{timeout:3000})
        .then(text=>{
            const $=cheerio.load(text);
            const nodes=$(web.key);
            if(_URL_MONITOR && web.root==_URL_MONITOR)
                console.log("test-218:",{root:web.root,nodes:nodes.toString(),body:$('body').toString()})
            const outs=[];
            if(!nodes.length) return outs;
            
            nodes.each((i,e)=>{
                const out={};
                //extract 
                Object.keys(web.configs).forEach(key=>{
                    const config=web.configs[key];
                    out[key]=extractInfor(config,$(e),web);
                })
                outs.push({...out,logo:web.logo})
            }) 
            return outs;
        })
        .catch(err=>{console.log("003. fetch error",{host:_host,err});return []})
    })
    Promise.all(alls).then(result=>{
        const arrs=result.reduce((acc,cur)=>[...acc,...cur],[]).filter(x=>x);
        res.send({arrs,msg:'test'})
    })
    .catch(err=>res.send({arrs:[],error:JSON.stringify(err)}))
    .finally(()=>{console.log("done!")})
})


