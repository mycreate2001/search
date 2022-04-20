const request=require('request')

function fetch(url,opts){
    return new Promise((resolve,reject)=>{
        if(!url) return reject(new Error("url is empty"))
        if(!opts)
            request(url,(err,res,body)=>{
                if(err) return reject(err);
                return resolve(body)
            })
        else
            request(url,opts,(err,res,body)=>{
                if(err) return reject(err);
                return resolve(body)
            })
    })
}

module.exports={fetch}
