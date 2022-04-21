const {search}=require('../service/search.js')
class Search{
    index(req,res){
        const key=(req.query['q']).trim()
        search(key).then(prods=>{
            res.send({arrs:prods})
        })
        .catch(err=>{
            console.log("\nERROR router/search.js:9\n--------------------",{err})
            res.send({error:err.message,arrs:[]})
        })
    }
}
module.exports=new Search()
