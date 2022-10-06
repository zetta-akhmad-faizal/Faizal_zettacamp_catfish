function getCookies(prod){
    if(localStorage.getItem('cookies') === null){
        localStorage.setItem('cookies', prod);
    } else {
        localStorage.setItem('cookies', prod);
    }
}

function callJson(){
    let prod = document.getElementById('prod');
    let prices = document.getElementById('prices');
    let desc = document.getElementById('desc');
    let img = document.getElementById('img-prod');
    let from = document.getElementById('from');
    let size = document.getElementById('size');
    let cookies = localStorage.getItem('cookies');

    if(cookies === null){
        alert('Cookies is null')
    }

    var xmlhttp = new XMLHttpRequest(); 
    var url = "../assets/js/data.json"
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.onload = (res) => {
        let message = JSON.parse(res['target']['response']);
        let init = '';
        // console.log(message.data[1].size)
        for(let i=0; i< message.data.length; i++){
            if(message.data[i].title === cookies){
                prod.innerHTML = message.data[i].title;
                prices.innerHTML = message.data[i].price;
                desc.innerHTML = message.data[i].desc;
                from.innerHTML = message.data[i].from;
                message.data[i].size.forEach((n) => {
                    init += `${n}/`
                });
                size.innerHTML = init;
                img.src = message.data[i].url;
                img.alt = `${message.data[i].title} image`;
            }
        }
    };
    xmlhttp.send();
}

function storageAvailableJson(){
    let order_list = document.getElementById('list-available');
    var xmlhttp = new XMLHttpRequest(); 
    var url = "../assets/js/data.json"
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.onload = (res) => {
        let message = JSON.parse(res['target']['response']);
        let init = ''
        // console.log(message.data[1].size)
        for(let i=0; i< message.data.length; i++){
            init += `
                <li class="items-storage">
                    <div class="row">
                        <div class="column-4">
                            <img src=${message.data[i].url} alt='${message.data[i].title} image' style="width:100%">
                        </div>
                        <div class="column-5">
                            <h1>${message.data[i].title}</h1>
                            <p>34 X <span>${message.data[i].price}</span></p>
                        </div>
                    </div>
                </li>
            `
        }
        order_list.innerHTML = init;
    };
    xmlhttp.send();
}
function storageSoldJson(){
    let order_list = document.getElementById('list-sold');
    var xmlhttp = new XMLHttpRequest(); 
    var url = "../assets/js/data.json"
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.onload = (res) => {
        let message = JSON.parse(res['target']['response']);
        let init = ''
        // console.log(message.data[1].size)
        for(let i=0; i< message.data.length-3; i++){
            init += `
                <li class="items-storage">
                    <div class="row">
                        <div class="column-4">
                            <img src=${message.data[i].url} alt='${message.data[i].title} image' style="width:100%">
                        </div>
                        <div class="column-5">
                            <h1>${message.data[i].title}</h1>
                            <p>34 X <span>${message.data[i].price}</span></p>
                        </div>
                    </div>
                </li>
            `
        }
        order_list.innerHTML = init;
    };
    xmlhttp.send();
}