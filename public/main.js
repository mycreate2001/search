let arrs = [];
        let views = [];
        const form = document.querySelector("form#search");
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
            const keys = (keyword.value + "").trim().split(/[;,.: ]/g).filter(x => x && x != ' ');
            console.log("001. Keys",keys)
            fetch('/api/search?q=' + keys.join("+")).then(res => res.json())
                .then(result => {
                    // console.log("result",result.arrs);
                    arrs = result.arrs.map(arr => {
                        const price = getNumber(arr.price);
                        return { ...arr, price }
                    }).filter(x=>x&&x.price)
                    console.log("result", arrs);
                    update();
                })
                .catch(err => { arrs = [] })
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
            views = arrs.sort((a, b) => a.price - b.price)
            build('#content')
        }

        /** build */
        function build(selector) {
            console.log("element:",{selector,element:document.querySelector(selector)})
            const content = views.map(data => `
                <a class='col-xs-6 col-sm-6 col-md-3 col-lg-2 item' href="${data.url}" target="_blank">
                    <img src='${data.image}' class='item_image'>
                    <img src='${data.logo}' class='logo'>
                    <div class='item_title' >${data.name}</div>
                    <div class='item_price'>${dispPrice(data.price)}</div>
                </a>
            `).join("")
            document.querySelector(selector).innerHTML = content
        }