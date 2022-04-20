const cheerio=require('cheerio')

const html=`<ul id="fruits">
<li class="apple">Apple</li>
<li class="orange">Orange</li>
<li class="pear">Pear</li>
</ul>"`

const node=cheerio.load(html);

console.log("test1:",{node:node})
console.log("\ntest2:",{test2:node(this)})