function getValue(){
    let theme = document.getElementById('theme').value;
    let universal = document.getElementsByTagName("*");

    if(theme === 'light'){
        for(let i=0; i < universal.length; i++){
            universal[i].style.color = 'black';
        }
        document.body.style.backgroundColor= 'white';
        document.getElementById("theme").style.backgroundColor = 'white';
        document.getElementById("theme").style.color = 'black';
        
    }else if(theme === 'dark'){
        for(let i=0; i < universal.length; i++){
            universal[i].style.color = 'white';
        }
        document.body.style.backgroundColor= 'black';
        document.getElementById("theme").style.backgroundColor = 'black';
        document.getElementById("theme").style.color = 'white';
    }
}
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        {
            pageLanguage: "en"
        },
        "google_translate_element"
    );
}