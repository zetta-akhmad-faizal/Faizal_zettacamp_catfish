particlesJS.load('particles-js', 'assets/js/particlesjs-config.json', function() {
    console.log('callback - particles.js config loaded');
});

function searchBar(){
    let table = document.getElementsByTagName("td");
    let search = document.getElementById("searching");
    let pagination = document.getElementById("code");
    let filter = search.value.toUpperCase();
    for(let i=0;i < table.length; i++){
        console.log(table[i].outerText.toUpperCase().indexOf(filter))
        if(table[i].outerText.toUpperCase().indexOf(filter) > -1){
            table[i].style.display = " ";
            pagination.innerHTML = `${table[i].cellIndex} of ${table[i].cellIndex}`; 
        }else{
            table[i].style.display = "none";
        }
    }
}