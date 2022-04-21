const router=require('express').Router();
const search=require('./search.js')
//api/search
router.get("/search",search.index)

module.exports=router;