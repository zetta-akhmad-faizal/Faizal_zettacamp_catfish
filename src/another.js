const fs = require('fs');

let varPromise = (f, time) => {
    console.log('Data will display 5s')
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fs.readFile(f, 'utf-8', (err, data) => {
                if(err) reject({
                    status: 400,
                    message: `${err.path} isn't found`
                });
                console.log('Data success')
                resolve(data);
            })
        }, time)
    })
}

let userPromiseCall = async() => {
    try{
        const data = await varPromise('./assets/user.txt', 2000);
        const {users} = JSON.parse(data);
        return users
    }catch(e){
        return e
    }
}

let playlistPromiseCall = async() => {
    try{
        const data = await varPromise('./assets/data.txt', 3000);
        const {playlist} = JSON.parse(data);
        return playlist
    }catch(e){
        return e
    }
}

module.exports = {userPromiseCall, varPromise, playlistPromiseCall};