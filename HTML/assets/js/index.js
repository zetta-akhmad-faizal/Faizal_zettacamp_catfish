function homeData() {
    let home = document.getElementById('home');
    let init = '';
    let request = new XMLHttpRequest();
    request.open("GET", 'assets/js/data.json', true);
    request.setRequestHeader("Content-type", "application/json");
    request.onload = (res) => {
        let message = JSON.parse(res['target']['response']);
        for (let i = 0; i < message.data.length - 6; i++) {
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

function countryFecth() {
    let home = document.getElementById('country');
    let init = '';
    let request = new XMLHttpRequest();
    request.open("GET", '../assets/js/country.json', true);
    request.setRequestHeader("Content-type", "application/json");
    request.onload = (res) => {
        let message = JSON.parse(res['target']['response']);
        for (let i = 0; i < message.length - 6; i++) {
            init += `
            <option>
                ${message[i].name}
            </option>
            `;
        }
        // console.log(init)
        home.innerHTML = init
    };
    request.send();
}

function cardInputByImage(){
    let price = document.getElementById('price').value;
    let title = document.getElementById('title').value;
    let urlInput = document.getElementById('myFile').value;
    let cardByImage = JSON.parse(localStorage.getItem('cardByImage'));
    let urlValue = urlInput.split('\\');
    let url = `../assets/img/${urlValue[2]}`;

    let data = {
        url, title, price
    };
    cardByImage.push(data);
    localStorage.setItem('cardByImage',JSON.stringify(cardByImage));
    alert('Refresh page');
}

function cardInputByURL(){
    let price = document.getElementById('price-url').value;
    let title = document.getElementById('title-url').value;
    let url = document.getElementById('myURL').value;
    let cardByImage = JSON.parse(localStorage.getItem('cardByImage'));

    let data = {
        url, title, price
    };
    // console.log(url)
    cardByImage.push(data);
    localStorage.setItem('cardByImage',JSON.stringify(cardByImage));
    alert('Refresh page');
}

function catalogData() {
    let home = document.getElementById('catalog');
    let init = '';
    let request = new XMLHttpRequest();
    request.open("GET", '../assets/js/data.json', true);
    request.setRequestHeader("Content-type", "application/json");
    request.onload = (res) => {
        let message = JSON.parse(res['target']['response']);
        for (let i = 0; i < message.data.length; i++) {
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

function cardData() {
    let home = document.getElementById('card');
    let init = '';
    let request = localStorage.getItem('cardByImage');
    let message = JSON.parse(request);
    for (let i = 0; i < message.length; i++) {
        init += `
        <article class="items shopping-basis">
            <img src='${message[i].url}' alt='${message[i].title}'>
            <p>${message[i].title}</p>
            <span>IDR ${message[i].price}</span>
        </article>
        `;
    }
    home.innerHTML = init
}
function cardData() {
    let home = document.getElementById('card');
    let init = '';
    let request = localStorage.getItem('cardByImage');
    let message = JSON.parse(request);
    for (let i = 0; i < message.length; i++) {
        init += `
        <article class="items shopping-basis">
            <img src='${message[i].url}' alt='${message[i].title}'>
            <p>${message[i].title}</p>
            <span>IDR ${message[i].price}</span>
        </article>
        `;
    }
    home.innerHTML = init
}

function openForm(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "flex";
    evt.currentTarget.className += " active";
}

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();

        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove("drop-zone--over");
    });
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").remove();
    }

    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

   
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    } else {
        thumbnailElement.style.backgroundImage = null;
    }
}