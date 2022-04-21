"use strict"
const path=require('path');
const fs=require('fs')
const _STORAGE_PATH="storage";
const _ID_LENGHT_DEFAULT_=20;

class Database{
    #file="";
    #name="";
    #db=[];
    #idLength=_ID_LENGHT_DEFAULT_;
    /**
     * connect to database
     * @param {string} name 
     */
    constructor(name,opts={}){
        this.#name=name;
        this.#file=path.join(__dirname,"..","..",_STORAGE_PATH,name+'.json');
        console.log("file:'%s'",this.#file);
        this.#db=this.#connect(this.#file);
        this.#idLength=opts.idLength||_ID_LENGHT_DEFAULT_;
    }

    /**
     * create/update data
     * @param {any[]|any} datas 
     * @param {boolean} commit default=true, true=enable update to file or not
     * @param {Function} check default=null, hander function, true=success 
     * @returns {string[]} id of added list
     */
    add(datas,commit=true,check=null){
        let addList=[];
        [].concat(datas).forEach(data=>{
            if(typeof data!='object') {
                console.log("format wrong");
                return ;
            }
            const id=data.id||makeId(this.#db,"id",this.#idLength);
            //check
            if(check && !check(data)){
                console.log("check wrong");
                return;
            }
            const pos=this.#db.findIndex(x=>x.id===id);
            if(pos==-1){
                this.#db.push({...data,id});
                console.log("'%s' add new '%s'",this.#name,id);
            }else{
                this.#db[pos]={...data,id};
                console.log("'%s' update '%s'",this.#name,id);
            }
            addList.push(id);
        })
        if(commit) this.commit();
        return addList;
    }

    /**
     * get data from db by id
     * @param {string} id 
     * @returns {object} data
     */
    get(id){
        if(!id) return;
        return this.#db.find(x=>x.id===id); 
    }

    /**
     * return all object as filter condition
     * @param {object} filter filter, ex:{name:'abc',age:13}
     * @returns {any[]} array of db
     * @example const db=new Database('db'); db.getAll({name:'test'})
     */
    getAll(filter={}){
        if(typeof filter!=='object'){
            console.log("filter is wrong");
            return [];
        }
        if(filter=={}) return this.#db;//not filter
        let outs=this.#db;
        Object.keys(filter).forEach(key=>{
            outs=outs.filter(x=>x[key]==filter[key])
        })
        return outs
    }

    /**
     * delete record from db
     * @param {string[]|Array<object>} ids id/ids of data
     * @param {boolean} commit default=true, true=save to file
     * @returns {string[]} deleted list
     * @example const a=new Database('something'); a.delete('1234'); a.delete(['1234','2256'],false)
     */
    delete(ids,commit=true){
        let result=[];
        [].concat(ids).forEach(id=>{
            if(typeof id!='string') id=id.id;
            const pos=this.#db.findIndex(d=>d.id===id);
            if(pos==-1) return;
            result.push(id);
            this.#db.splice(pos,1);
        })
        console.log("'%s' deleted '%s'",this.#name,result);
        if(commit) this.commit();
        return result;
    }

    /**
     * show db table
     * @param {string} title 
     */
    show(title='current db'){
        console.log("show db '%s' title:'%s'",this.#name,title);
        console.table(this.#db);
    }

    /**
     * set for all data with opts
     * @param {object} opts 
     * @param {boolean} commit true= save to file, default=False
     * @example const a=new Database('somefile');a.setAll({status:true})
     */
    setAll(opts={},commit=false){
        this.#db.forEach(db=>{
            Object.keys(opts).forEach(key=>{
                db[key]=opts[key];
            })
            this.add(db,false);
        })
        if(commit) this.commit();
    }

    /**
     * save db to file
     * @returns {boolean} true= complete
     */
    commit(){
        fs.writeFile(this.#file,JSON.stringify(this.#db),(err)=>{
            if(err) {console.log("'%s' commit failured!, err:",this.#name,err);return false;}
            console.log("'%s' committed successfully",this.#name); 
            return true;
        })
    }

    /**
     * read file
     * @param {string} path 
     * @returns {any[]} data on json file
     */
    #connect(path){
        try{
            let data=fs.readFileSync(path,{encoding:'utf8',flag:'r+'});
            // console.log("\nlocal-database.js \ test-001:153\n--------------------------------\n",{data})
            if(!data) return [];
            data= JSON.parse(data);
            // console.log("\nlocal-database.js \ test-002:156\n--------------------------------\n",{data})
            console.log("'%s' connected",this.#name);
            return data;
        }
        catch(err){
            console.log("'%s' connect is failured");
            this.commit();
            return []
        }
    }

}

module.exports=Database;