const express=require('express')
const htmlx=require('cross-fetch');
const cheerio=require('cheerio');
const PORT=4000;
//
const webs=[
    {   
        //phucanh.vn
        root:'https://www.phucanh.vn',
        search:'/tim?q=',
        delimiter:'+',
        key:'.p-container',
        logo:'https://hanoicomputercdn.com/media/lib/19-02-2022/logo-hacomtrangch.png',
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
        //mediamart.vn
        root:'https://mediamart.vn',
        search:'/tag?key=',
        delimiter:'+',
        key:'div.card.mb-4',
        logo:'https://mediamart.vn/css/images/logo.png',
        configs:{
            image:{
                key:'source[type="image/jpeg"]',
                attr:'srcset'
            },
            name:{
                key:'h5.card-title'
            },
            price:{
                key:'p.product-price',
                subfix:'₫'
            },
            url:{
                key:'a',
                attr:'href',
                handler:joinUrl
            }
        }
    },
    //hanoicomputer
    {
        root:'https://www.hanoicomputer.vn',
        search:'/tim?q=',
        delimiter:'+',
        key:'div.p-component.item',
        logo:'https://hanoicomputercdn.com/media/lib/19-02-2022/logo-hacomtrangch.png',
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
                attr:'data-price'
    
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
        logo:'https://cdn1.timviecnhanh.com/images/old_employer_avatar/images/b5a52e09d147942df3595ee137825df9_5b179a526805c_1528273490.png',
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
    },
    //nguyenkim
    {
        root:'https://www.nguyenkim.com',
        search:'/tim-kiem.html?tu-khoa=',
        delimiter:'+',
        key:'div.product-card',
        logo:'https://printgo.vn/uploads/file-logo/1/512x512.91f4170797835614f0d5672ecf4d7778.ai.1.png',
        configs:{
            image:{
                key:'img[loading="lazy"]',
                attr:'src'
            },
            name:{
                key:'div.product-card__title',
                ignore:/[\n]/g
            },
            price:{
                key:'p.product-card__price-after-amount'
            },
            url:{
                key:'a',
                attr:'href',
                handler:joinUrl
            }
        }
    },
    //dienmayxanh.vn
    {
        root:'https://www.dienmayxanh.com',
        search:'/tag/',
        delimiter:'-',
        search2:'?key=',
        delimiter2:'+',
        logo:'https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-dien-may-xanh-inkythuatso-01-08-13-34-13.jpg',
        key:'li.item',
        configs:{
            image:{
                key:'img',
                attr:'data-src'
            },
            name:{
                key:'a',
                attr:'data-name',
            },
            price:{
                key:'a',
                attr:'data-price'
            },
            url:{
                key:'a',
                attr:'href',
                handler:joinUrl
            }
        }

    },
    // thegioididong.com
    {
        root:'https://www.thegioididong.com',
        search:'/tim-kiem?key=',
        delimiter:'+',
        logo:'https://upload.wikimedia.org/wikipedia/vi/thumb/8/8d/The_gioi_di_dong_logo.svg/512px-The_gioi_di_dong_logo.svg.png?20200322054322',
        key:'ul.listproduct li.item',
        configs:{
            image:{
                key:'img',
                attr:'data-src'
            },
            name:{
                key:'a',
                attr:'data-name',
            },
            price:{
                key:'a',
                attr:'data-price'
            },
            url:{
                key:'a',
                attr:'href',
                handler:joinUrl
            }
        }
    }
]

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
    console.log("001. input '%s'",keys.join(" "))
    const alls=webs.map(web=>{
        let _host=web.root+web.search+keys.join(web.delimiter);
        if(web.search2&&web.delimiter2) _host+=web.search2+keys.join(web.delimiter2)
        console.log("002. fetch '%s'",_host)
        return htmlx.fetch(_host)
        .then(res=>{
            // console.log("002. fetch '%s'",_host,{configs:web.configs,status:res.status})
            if(res.status>=400) throw new Error(`bad respond from server, status:${res.status}`);
            return res.text().then(
                (text)=>{
                    const $=cheerio.load(text);
                    const nodes=$('body').find(web.key);
                    // if(web.root=='https://www.thegioididong.com')
                    //     console.log("test-218:",{nodes,root:web.root,length:nodes.length})
                    const outs=[];
                    if(!nodes.length) return outs;
                    
                    nodes.each((i,e)=>{
                        const node=cheerio.load(e);
                        const out={};
                        // Object.keys(web.configs).forEach(key=>{
                        //     const config=web.configs[key];
                        //     const _node=node(config.key);
                        //     let value=config.attr?_node.attr(config.attr):_node.text();
                        //     const raw=value;
                        //     value=(config.prefix||config.subfix)?extractString(value,config.prefix,config.subfix):value;
                        //     value=config.ignore?value.replace(config.ignore,""):value;
                        //     value=(value)?value.trim():value;
                        //     value=config.handler?config.handler(value,web):value;
                        //     out[key]=value;
                        //     // if(web.root=='https://www.dienmayxanh.com')
                        //     //     console.log({url:_host,key,value,config})
                        //     if(!value)
                        //         console.log("\ndebug-240:",{url:_host,key,value,raw,node:_node.toString(),config})
                        // })
                        Object.keys(web.configs).forEach(key=>{
                            const config=web.configs[key];
                            out[key]=extractInfor(config,node,web);
                        })
                        outs.push({...out,logo:web.logo})
                    }) 
                    return outs;
                }
            )
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
 * get infor from config
 * @param { import('.').ConfigData } config   extract data
 * @param {cheerio.CheerioAPI} node            node
 * @returns {string} value
 */
function extractInfor(config,node,web){
    if(!config||!Object.keys(config).length) return ""
    if(!node) return ""
    if(config.value) return config.value;
    if(!config.key) return ""
    const _node=node(config.key);
    let value=config.attr?_node.attr(config.attr):_node.text();
    value=(config.prefix||config.subfix)?extractString(value,config.prefix,config.subfix):value;
    value=config.ignore?value.replace(config.ignore,""):value;
    value=(value)?value.trim():value;
    value=config.handler?config.handler(value,web):value;
    return value;
}

/**
 * 
 * @param {string} url 
 * @param {string} web 
 * @returns {string}
 */
function joinUrl(url,web){
    if(!url) return ""
    const root=web.root;
    if(url.startsWith('/')) url=root+url;
    else if(!url.startsWith('http')) url=root+"/"+url;
    return url;
}

