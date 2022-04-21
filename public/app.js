let arrs = [];
        let views = [];
        const form = document.querySelector("form#form-search");
        form.addEventListener("submit",(e)=>{
            search();
            e.preventDefault();
        })
        // form.onsubmit=search;
        const input=form.querySelector("input");
        input.keyup=(event) => {
            if (event.keyCode == 13) {
                search();
            }
        }

        function search() {
            document.body.style.cursor = "wait"
            const keyword = form.querySelector("input");
            const keys = (keyword.value + "").toLowerCase().trim().split(/[;,.: ]/g).filter(x => x && x != ' ');
            console.log("Keys",keys)
            views=[];
            build('#content')
            fetch('/api/search?q=' + keys.join("+")).then(res => res.json())
                .then(result => {
                    console.log({raws:result})
                    arrs = result.arrs.map(arr => {
                        const price = getNumber(arr.price);
                        let points=0;
                        
                        keys.forEach(key=>{
                            let pos=(arr.name+"").toLowerCase().indexOf(key)
                            if(pos!=-1) {
                                points++;
                                const _replace=(arr.name+"").substring(pos,pos+key.length);
                                // console.log("test",{pos,_replace,key,name:arr.name})
                                arr.name=(arr.name+"").replace(_replace,`<strong>${_replace}</strong>`)
                            }
                        })
                        return { ...arr, price,points }
                    }).filter(x=>x&&x.price&&x.points)

                    // console.log("result", arrs);
                    update();
                })
                .catch(err => { arrs = [];console.log(err) })
                .then(() => { document.body.style.cursor = "initial" });
                // e.preventDefault();
        }

    

        function getNumber(str) {
            str = str + '';
            let out = ''
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                if (char >= '0' && char <= '9') out += char;
            }
            return parseInt(out);
        }
        function dispPrice(price) {
            const out = (price).toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            // console.log("debug",{input:price,output:out})
            return out;
        }
        /** update */
        function update() {
            views = arrs.sort((a, b) => b.points - a.points);
            // console.log({views});
            build('#content')
        }

        /** build */
        function build(selector) {
            // console.log("element:",{selector,element:document.querySelector(selector)})
            const content = views.map(data => `
                <div class='col-xs-6 col-sm-6 col-md-3 col-lg-3 col-xl-2 item' >
                    <img src='${data.image}' class='item_image'>
                    <img src='${data.logo}' class='logo'>
                    <a class='item_title' href="${data.url}" target="_blank">${data.name}</a>
                    <div class='item_price'>${dispPrice(data.price)}</div>
                </div>
            `).join("")
            document.querySelector(selector).innerHTML = content
        }