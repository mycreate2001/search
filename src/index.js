const request=require('request')
const express=require('express')
const htmlx=require('cross-fetch');
const cheerio=require('cheerio')
//
const webs=[
    {
        root:'https://www.phucanh.vn',
        search:'/tim?q=',
        delimiter:'+',
        key:'.p-container',
        configs:{
            image:{
                key:'img.lazy',
                attr:'data-src'
            },
            name:{
                key:'h3.p-name'
            },
            price:{
                key:'span.p-price2:not([style])',
                prefix:'Giá Bán',
                ignore:/[\n:]/g
            },
            url:{
                key:'a.p-img',
                attr:'href',
                handler:joinUrl
            }
        }
    },
    {
        root:'https://mediamart.vn',
        search:'/tag?key=',
        delimiter:'+',
        key:'div.card.mb-4',
        configs:{
            image:{
                key:'source[type="image/jpeg"]',
                attr:'srcset'
            },
            name:{
                key:'h5.card-title'
            },
            price:{
                key:'p.product-price'
            },
            url:{
                key:'a',
                attr:'href',
                handler:joinUrl
            }
        }
    },
    {
        root:'https://www.hanoicomputer.vn',
        search:'/tim?q=',
        delimiter:'+',
        key:'div.p-component.item',
        configs:{
            image:{
                key:'img.lazy',
                attr:'data-src'
            },
            name:{
                key:'h3.p-name'
            },
            price:{
                key:'span.p-price',
    
            },
            url:{
                key:'div.p-img a',
                attr:'href',
                handler:joinUrl
            }
        }

    },
    //sellphones
    {
        root:'https://cellphones.com.vn',
        search:'/catalogsearch/result/?q=',
        delimiter:'+',
        key:'div.item-product',
        configs:{
            image:{
                key:'div.item-product__box-img img',
                attr:'data-src'
            },
            name:{
                key:'div.item-product__box-name',
                ignore:'\n'
    
            },
            price:{
                key:'p.special-price'
            },
            url:{
                key:'div.item-product__box-name a',
                attr:'href',
                handler:joinUrl
            }
        }
    }
]

const PORT=80;

const app=express();
app.use(express.static("public"))
app.set('view engine',"ejs");
app.set('views','./views');
app.listen(PORT);



app.get("/",(req,res)=>{
    res.render("index");
})

app.get("/api/search",(req,res)=>{
    const keys=(req.query['q']).trim().split(/[,. :;+]/g);
    console.log("001. input",{keys,params:req.query})
    const alls=webs.map(web=>{
        const _host=web.root+web.search+keys.join(web.delimiter);
        return htmlx.fetch(_host)
        .then(res=>{
            if(res.status>=400) throw new Error("bad respond from server");
            console.log("002. web content",{host:web.root,status:res.status})
            return res.text().then(
                (text)=>{
                    const $=cheerio.load(text);
                    const nodes=$('body').find(web.key);
                    const outs=[];
                    nodes.each((i,e)=>{
                        const node=cheerio.load(e);
                        const out={};
                        Object.keys(web.configs).forEach(key=>{
                            const config=web.configs[key];
                            console.log("test-00001",{config,key})
                            const _node=node(config.key);
                            let value=config.attr?_node.attr(config.attr):_node.text();
                            value=config.prefix?extractString(value,config.prefix,config.subfix):value;
                            value=config.ignore?value.replace(config.ignore,""):value;
                            value=(value)?value.trim():value;
                            value=config.handler?config.handler(value,web):value;
                            out[key]=value;
                        })
                        outs.push(out)
                    }) 
                    return outs;
                }
            )
        })
        .catch(err=>{console.log({host:_host,err});throw err})
    })
    Promise.all(alls).then(result=>{
        const arrs=result.reduce((acc,cur)=>[...acc,...cur],[])
        res.send({arrs})
    })
    .catch(err=>res.send({arrs:[],error:JSON.stringify(err)}))
})

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

/**
 * 
 * @param {string} url 
 * @param {string} web 
 * @returns {string}
 */
function joinUrl(url,web){
    const root=web.root;
    if(url.startsWith('/')) url=root+url;
    else if(!url.startsWith('http')) url=root+"/"+url;
    return url;
}

