particlesJS.load('particles-js', 'assets/js/particlesjs-config.json', function() {
    console.log('callback - particles.js config loaded');
});


function getValue(){
    let fn = document.getElementById("fn").value;
    let ln = document.getElementById("ln").value;
    let m = document.getElementById("m").value;
    let fm = document.getElementById("fm").value;
    // let talent_ac = document.getElementsByClassName("ac").value;
    // let talent_sp = document.getElementsByClassName("sp").value;
    // let talent_tr = document.getElementsByClassName("tr").value;
    let talent = document.querySelectorAll("input[type='checkbox']");
    let git = document.getElementById("git").value;
    let email = document.getElementById("email").value;
    let dob = document.getElementById("date").value;
    let desc = document.getElementById("desc_myself").value;
    let telp = document.getElementById("telp").value;
    document.getElementById("first_name").innerHTML = fn;
    document.getElementById("last_name").innerHTML = ln;
    document.getElementById("gen").innerHTML = m || fm;
    document.getElementById("e-mail").innerHTML = email;
    document.getElementById("git_acc").innerHTML = git;
    document.getElementById("mytelp").innerHTML = telp;
    document.getElementById("born").innerHTML = dob;
    document.getElementById("mydesc").innerHTML = desc;
    for(let i=0;i < talent.length;i++){
        document.getElementById("talent").innerHTML = `My Hobbies: <ul><li>${talent[i].value}</li></ul>`
    }
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