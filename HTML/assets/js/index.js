function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0,3)
}

function callJson(){
    let items = document.getElementById('items');
    let init = '';
    var xmlhttp = new XMLHttpRequest(); 
    var url = "../assets/js/data.json"
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.onload = (res) => {
        let message = JSON.parse(res['target']['response']);
        let arrSize = shuffleArray(message.data[0].size)
        for(let i=0; i< message.data.length; i++){
            init += `
                <section class="items">
                    <img src='${message.data[i].url}' alt='${message.data[i].title}'>
                    <p>${message.data[i].title}</p>
                    <p>Size : <small>${arrSize.sort()}</small></p>
                    <span>${message.data[i].price}</span>
                    <div class='desc'>
                        <p>${message.data[i].desc}</p>
                    </div>
                    <button class='button'>View Product</button>
                </section>
            `;
            items.innerHTML = init; 
        }
    };
    xmlhttp.send();
}