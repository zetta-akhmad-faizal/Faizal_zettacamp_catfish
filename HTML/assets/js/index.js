function getCookies(prod){
    if(localStorage.getItem('cookies') === null){
        localStorage.setItem('cookies', prod);
    } else {
        localStorage.setItem('cookies', prod);
    }
}
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0,3)
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
        let arrSize = shuffleArray(message.data[0].size)
        for(let i=0; i< message.data.length; i++){
            if(message.data[i].title === cookies){
                prod.innerHTML = message.data[i].title;
                prices.innerHTML = message.data[i].price;
                desc.innerHTML = message.data[i].desc;
                from.innerHTML = message.data[i].from;
                size.innerHTML = arrSize.sort();
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
        let items = [34, 12, 54, 25]
        let randArray = shuffleArray(items);
        let message = JSON.parse(res['target']['response']);
        let init = ''
        for(let i=0; i< message.data.length; i++){
            init += `
                <li class="items-storage">
                    <div class="row">
                        <div class="column-4">
                            <img src=${message.data[i].url} alt='${message.data[i].title} image' style="width:100%">
                        </div>
                        <div class="column-5">
                            <a href='view.html' onclick='getCookies("${message.data[i].title}")'>${message.data[i].title}</a>
                            <p>${randArray[0]} X <span>${message.data[i].price}</span></p>
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
        let items = [34, 12, 54, 25]
        let randArray = shuffleArray(items);
        let message = JSON.parse(res['target']['response']);
        let init = ''
        // console.log(message.data[1].size)
        for(let i=0; i< message.data.length-6; i++){
            // console.log(message.data[i].price)
            init += `
                <li class="items-storage">
                    <div class="row">
                        <div class="column-4">
                            <img src=${message.data[i].url} alt='${message.data[i].title} image' style="width:100%">
                        </div>
                        <div class="column-5">
                            <a href='view.html' onclick='getCookies("${message.data[i].title}")'>${message.data[i].title}</a>
                            <p>${randArray[1]} X <span>${message.data[i].price}</span></p>
                        </div>
                    </div>
                </li>
            `
        }
        order_list.innerHTML = init;
    };
    xmlhttp.send();
}

function keyUpAvailable(){
    let myInput, filter, ul, li, a;
    myInput = document.getElementById("search-available");
    filter = myInput.value.toUpperCase();
    ul = document.getElementById("list-available");
    li = ul.getElementsByTagName("li");
    for (let i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
        } else {
        li[i].style.display = "none";
        }
    }
}
function keyUpSold(){
    let myInput, filter, ul, li, a;
    myInput = document.getElementById("search-sold");
    filter = myInput.value.toUpperCase();
    ul = document.getElementById("list-sold");
    li = ul.getElementsByTagName("li");
    for (let i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
        } else {
        li[i].style.display = "none";
        }
    }
}