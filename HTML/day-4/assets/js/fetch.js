let tbody = document.getElementById("display");
let data = JSON.parse(localStorage.getItem("arr"));
let i = 0;
let init = '';
let ul = '<ul>';
for(i; i < data.length; i++){
    ul += `<li>${data[i].talent[2]}</li>`;
    init += `
        <tr>
            <td>${data[i].first_name}</td>
            <td>${data[i].last_name}</td>
            <td>${data[i].gender}</td>
            <td>${data[i].talent}</td>
            <td><a href="${data[i].git_acc}">Link</td>
            <td>${data[i].email}</td>
            <td>${data[i].dob}</td>
            <td>${data[i].mydesc}</td>
            <td id="telp">${data[i].telp}</td>
            <td>
                <img src="../assets/img/${data[i].my_image}" alt="myimage" style="widht:50px;height:100px;">
            </td>
        </tr>
    `
}
tbody.innerHTML = init;
console.log(ul)