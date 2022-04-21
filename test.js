const axios=require('axios').default
const {fetch} =require('./src/lib/util')
const urls=[
    'https://cellphones.com.vn/catalogsearch/result/?q=dell+inspiron+5410',

]

// urls.forEach(url=>{
//     axios.get(url).then(res=>console.log("result",{res}))
//     .catch(err=>console.log("error",{err}))
// })

urls.forEach(url=>{
    fetch(url).then(res=>console.log("result",{res}))
    .catch(err=>console.log("error",{err}))
})