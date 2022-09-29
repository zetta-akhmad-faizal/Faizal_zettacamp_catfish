function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
function formatDate(date) {
    return [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-');
}

let tbody = document.getElementById("display");
let data = JSON.parse(localStorage.getItem("arr"));
let i = 0;
let init = '';
let ul = '<ul>';
for(i; i < data.length; i++){
    let age = data[i].dob.split("-");
    let dob = Date.now() - new Date(`${age[1]}/${age[2]}/${age[0]}`);
    var age_dt = new Date(dob);  
    var year = age_dt.getUTCFullYear(); 
    var ages = Math.abs(year - 1970); 
    init += `
        <tr>
            <td>${data[i].first_name}</td>
            <td>${data[i].last_name}</td>
            <td>${data[i].gender}</td>
            <td>${data[i].talent}</td>
            <td><a href="${data[i].git_acc}">Link</td>
            <td>${data[i].email}</td>
            <td>${data[i].dob}</td>
            <td>${data[i].mydesc}. My old is ${ages}</td>
            <td id="telp">${data[i].telp}</td>
            <td>
                <img src="../assets/img/${data[i].my_image}" alt="myimage" style="widht:50px;height:100px;">
            </td>
        </tr>
    `; 
    console.log(ages)
}
tbody.innerHTML = init;