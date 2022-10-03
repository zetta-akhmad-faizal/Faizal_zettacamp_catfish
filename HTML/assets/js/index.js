function getValue(){
    let dob = document.getElementById('dob').value;
    let old = document.getElementById('old');
    let old_p = document.getElementById('old-p');
    if(dob === ''){
        old_p.innerHTML = "Please fill out your date of birth"
    }else{
        let oldSplit = dob.split("/");
        let getAges = Date.now() - new Date(`${oldSplit[1]}/${oldSplit[2]}/${oldSplit[0]}`);
        let age_dt = new Date(getAges);
        let year = age_dt.getUTCFullYear();
        let ages = Math.abs(year-1970);
        old.innerHTML = `${ages} years`
    }
}
