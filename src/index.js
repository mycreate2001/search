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
        image:{
            key:'img.lazy',
            attr:'data-src'
        },
        name:{
            key:'h3.p-name'
        },
        price:{
            key:'span.p-price2',
            first:'</i>',
            last:' \n'
        },
        url:{
            key:'a.p-img',
            attr:'href'
        }
    },
    {
        root:'https://mediamart.vn',
        search:'/tag?key=',
        delimiter:'+',
        key:'div.card.mb-4',
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
            attr:'href'
        }
    },
    {
        root:'https://www.hanoicomputer.vn',
        search:'/tim?q=',
        delimiter:'+',
        key:'div.p-component.item',
        image:{
            key:'img.lazy',
            attr:'data-src'
        },
        name:{
            key:'h3.p-name',
        },
        price:{
            key:'span.p-price',

        },
        url:{
            key:'div.p-img a',
            attr:'href'
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
                        const image=node(web.image.key).attr(web.image.attr)
                        const name=node(web.name.key).text();
                        const price=extractString(node(web.price.key).text(),web.price.first,web.price.last);// parseInt();
                        const url=web.root+node(web.url.key).attr(web.url.attr)
                        // console.log("\n\n=================\nimage:",{image,name,price});
                        outs.push({image,name,price,url})
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
    const pFirst=first.length?txt.indexOf(first):0;
    const pLast=last.length?txt.indexOf(last,pFirst):txt.length;
    // console.log("test extractString ",{txt,first,last,out:txt.substring(pFirst,pLast)})
    return txt.substring(pFirst+first.length,pLast)
}

