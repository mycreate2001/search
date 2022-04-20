const _URL_MONITOR="https://shopee.vn"
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
        logo:'https://danhgialon.com/wp-content/uploads/2018/04/mua-tu-lanh-o-nguyenkim.jpg',
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
        logo:'https://danhgialon.com/wp-content/uploads/2018/04/tu-lanh-mua-o-dau.png',
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
        logo:'https://static.ybox.vn/2018/12/1/1543830642352-23.png',
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
    },
    //shopee.vn
    {
        root:'https://shopee.vn',
        search:'/search?keyword=',
        delimiter:'%20',
        key:'div.shopee-search-item-result__item',
        logo:'https://brandfetch.com/_next/image?url=https%3A%2F%2Fasset.brandfetch.io%2FidGECW8fnU%2FidKAwcdNXs.png&w=128&q=75',
        configs:{
            image:{
                key:'img',
                attr:'src'
            },
            price:{
                key:'div.zp9xm9 span._3c5u7X'
            },
            name:{
                key:'div._3GAFiR'
            },
            url:{
                key:'a',
                attr:'href',
                handler:joinUrl
            }
        }
    },
    //tiki.vn
    {
        root:'https://tiki.vn',
        search:'/search?q=',
        delimiter:'%20',
        logo:'https://danhgialon.com/wp-content/uploads/2018/04/mua-tu-lanh-tren-tiki.png',
        key:'a.product-item',
        configs:{
            url:{
                key:'',
                attr:'href',
                handler:joinUrl
            },
            image:{
                key:'img',
                attr:'src'
            },
            name:{
                key:'div.name h3'
            },
            price:{
                key:'div.price-discount__price',
            }
        }
    }
]


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
    // if(!config.key) return ""
    const _node=node(config.key);
    let value=config.attr?_node.attr(config.attr):_node.text();
    value=(config.prefix||config.subfix)?extractString(value,config.prefix,config.subfix):value;
    value=config.ignore?value.replace(config.ignore,""):value;
    value=(value)?value.trim():value;
    value=config.handler?config.handler(value,web):value;
    if(_URL_MONITOR && web.root==_URL_MONITOR)
        console.log("debug-354:",{config,root:web.root,_node:_node.toString(),value})
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


module.exports={webs,extractInfor};