particlesJS.load('particles-js', 'assets/js/particlesjs-config.json', function() {
    console.log('callback - particles.js config loaded');
});


function getValue(){
    let fn = document.getElementById("fn").value;
    let ln = document.getElementById("ln").value;
    let gender = document.querySelectorAll("input[name='radio']");
    let talent = document.querySelectorAll("input[type='checkbox']");
    let git = document.getElementById("git").value;
    let email = document.getElementById("email").value;
    let dob = document.getElementById("date").value;
    let desc = document.getElementById("desc_myself").value;
    let telp = document.getElementById("telp").value;
    let my_image = document.getElementById("photo").value;
    document.getElementById("first_name").innerHTML = fn;
    document.getElementById("last_name").innerHTML = ln;
    document.getElementById("e-mail").innerHTML = email;
    document.getElementById("git_acc").innerHTML = git;
    document.getElementById("mytelp").innerHTML = telp;
    document.getElementById("born").innerHTML = dob;
    document.getElementById("mydesc").innerHTML = desc;

    let split = my_image.split("\\");
    let arr_talent = [];
    let my_talent='';let mygen='';
    for(let i=0;i < talent.length;i++){
        // console.log(talent[i].value)
        if(talent[i].checked == true){
            arr_talent.push(talent[i].value)
            my_talent += `<li>${talent[i].value}</li>`;
        }
    }
    for(let x=0; x<gender.length;x++){
        // console.log(gender[x].value)
        if(gender[x].checked == true){
            mygen += gender[x].value;
        }
    }
    // console.log(mygen)
    // console.log(my_talent)
    document.getElementById("my_image").src = `../assets/img/${split[2]}`;
    document.getElementById('gen').innerHTML = mygen;
    document.getElementById("hobi").innerHTML = "My Hobies:"
    document.getElementById("talent").innerHTML = my_talent;

    if(localStorage.getItem("arr") === null){
        localStorage.setItem("arr", JSON.stringify([]));
    }
    let provide = JSON.parse(localStorage.getItem("arr"));
    let data = {
        "first_name": fn,
        "last_name": ln,
        "gender": mygen,
        "talent": arr_talent,
        "git_acc": git,
        "email": email,
        "dob": dob,
        "mydesc": desc,
        "telp": telp,
        "my_image": split[2]
    };
    provide.push(data)
    localStorage.setItem("arr", JSON.stringify(provide))
}

function searchBar(){
    let table = document.getElementsByTagName("td");
    let search = document.getElementById("searching");
    let pagination = document.getElementById("code");
    let filter = search.value.toUpperCase();
    for(let i=0;i < table.length; i++){
        console.log(table[i].outerText.toUpperCase().indexOf(filter))
        if(table[i].outerText.toUpperCase().indexOf(filter) > -1){
            table[i].style.display = "";
            pagination.innerHTML = `${table[i].cellIndex} of ${table[i].cellIndex}`; 
        }else{
            table[i].style.display = "none";
        }
    }
}