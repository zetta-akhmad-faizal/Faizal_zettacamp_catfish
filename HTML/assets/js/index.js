function homeData(){
    let home = document.getElementById('home');
    let init = '';
    let request = new XMLHttpRequest();
    request.open("GET", 'assets/js/data.json', true);
    request.setRequestHeader("Content-type", "application/json");
    request.onload = (res) => {
        let message = JSON.parse(res['target']['response']);
        for(let i=0;i<message.data.length - 6;i++){
            init += `
            <article class="items home-basis">
                <img src='${message.data[i].url}' alt='${message.data[i].title}'>
                <p>${message.data[i].title}</p>
                <span>${message.data[i].price}</span>
            </article>
            `;
        }
        init += `<a href="feature/shopping-list.html">View More &rarr;</a>`
        console.log(init)
        home.innerHTML = init
    };
    request.send();
}

function catalogData(){
    let home = document.getElementById('catalog');
    let init = '';
    let request = new XMLHttpRequest();
    request.open("GET", '../assets/js/data.json', true);
    request.setRequestHeader("Content-type", "application/json");
    request.onload = (res) => {
        let message = JSON.parse(res['target']['response']);
        for(let i=0;i<message.data.length;i++){
            init += `
            <article class="items shopping-basis">
                <img src='${message.data[i].url}' alt='${message.data[i].title}'>
                <p>${message.data[i].title}</p>
                <span>${message.data[i].price}</span>
            </article>
            `;
        }
        home.innerHTML = init
    };
    request.send();
}