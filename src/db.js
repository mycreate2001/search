const _URL_MONITOR="https://shopee.vn"
const LocalDatabase=new require('./lib/local-database')
const db=new LocalDatabase('config');
const webs=db.getAll();
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
    if(web.root=='https://shopee.vn') console.log("\ndb.js \ test:37\n------------------\n",{node})
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



module.exports={webs,extractInfor};