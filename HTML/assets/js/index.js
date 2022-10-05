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
        document.getElementById('header').innerHTML = 'Cookies is null'
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
                size.innerHTML = init
                img.src = message.data[i].url;
                img.alt = `${message.data[i].title} image`;
            }
        }
    };
    xmlhttp.send();
}