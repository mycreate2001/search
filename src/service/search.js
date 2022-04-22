/** import library */
const LocalDatabase=require('../lib/local-database');
const cheerio=require('cheerio');
const axios=require('axios').default
const db=new LocalDatabase('config');


/**
 * 
 * @param {string} key 
 * @returns Promise<Object>
 */
function search(key){
    return new Promise((resolve,reject)=>{
        // return resolve('ok')
        let length=0;
        console.log("\n\nSearch='%s'\n--------------------------------------",key);
        const keys=key.trim().split(/[,. :;+]/g);
        const webs=db.getAll();
        //fetch data
        
        const alls=webs.map((web,_pos)=>{
            let _host=web.root+web.search+keys.join(web.delimiter);
            if(web.search2&&web.delimiter2) _host+=web.search2+keys.join(web.delimiter2)
            _host=encodeURI(_host);//debug
            console.log("%s. fetch '%s'",_pos,_host)
            return axios.get(_host,{maxRedirects:5})
            .then(text=>{
                const $=cheerio.load(text.data);
                const nodes=$(web.key);
                const outs=[];
                if(!nodes.length) return outs;
                
                nodes.each((i,e)=>{
                    const out={};
                    //extract 
                    Object.keys(web.configs).forEach(key=>{
                        const config=web.configs[key];
                        out[key]=extractInfor(config,$(e),web);
                    })
                    outs.push({...out,logo:web.logo,root:web.root})
                }) 
                return outs;
            })
            .catch(err=>{console.log("\nERROR search:41\n--------------------",{host:_host,err});return []})
        })
        //handler result
        Promise.all(alls).then(result=>{
            const arrs=result.reduce((acc,cur)=>[...acc,...cur],[]).filter(x=>x);
            length=arrs.length;
            return resolve(arrs);
        })
        .catch(err=>reject(err))
        .finally(()=>{
            console.log("done! search %s results\n",length)
        })
    })
}


/**
 * 
 * @param {string} txt 
 * @param {string} first 
 * @param {string} last
 */
 function extractString(txt,first="",last=""){
    txt=txt+""
    let pFirst=first?txt.indexOf(first):0;
    pFirst=pFirst==-1?0:pFirst
    let pLast=last?txt.indexOf(last,pFirst):txt.length;
    pLast=pLast==-1?txt.length:pLast;
    return txt.substring(pFirst+first.length,pLast)
}

const convertOpts={
    url:(url,web)=>{
        if(!url) return ""
        const root=web.root;
        if(url.startsWith('/')) url=root+url;
        else if(!url.startsWith('http')) url=root+"/"+url;
        return url;
    }
}

/**
 * get infor from config
 * @param { import('.').ConfigData } config   extract data
 * @param {cheerio.CheerioAPI} node            node
 * @returns {string} value
 */
function extractInfor(config,node,web){
    // if(web.root=='https://shopee.vn') console.log("\ndb.js \ test:37\n------------------\n",{node})
    if(!config||!Object.keys(config).length) return ""
    if(!node) return ""
    if(config.value) return config.value;
    const _node=config.key?node.find(config.key):node;
    let value=config.attr?_node.attr(config.attr):_node.text();
    value=(config.prefix||config.subfix)?extractString(value,config.prefix,config.subfix):value;
    value=config.ignore?value.replace(config.ignore,""):value;
    value=(value)?value.trim():value;
    if(config.fn&&config.fn.length )
        config.fn.forEach(fn=>{
        value=convertOpts[fn](value,web)})
    return value;
}


module.exports={search}
    