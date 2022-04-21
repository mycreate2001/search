/** Import library */
const express=require('express')
const PORT=4000;
const apiRouter=require('./routers')
/** Intial */
const app=express();
app.use(express.static("public"))
app.set('view engine',"ejs");
app.set('views','./views');
app.listen(PORT);

app.use("/api",apiRouter);
app.get("/",(req,res)=>{
    res.render("index");
})

