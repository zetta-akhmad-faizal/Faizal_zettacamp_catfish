const fs = require('fs');

let varPromise = (files, time, type) => {
    console.log(`Data ${type} will be loaded 5s`)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fs.readFile(files, 'utf-8', (err, data) => {
                if(err) reject({
                    status: 400,
                    message: `${err.path} isn't found`
                });
                console.log(`Data ${type} is loaded`)
                resolve(data);
            })
        }, time)
    })
}

let userPromiseCall = async() => {
    try{
        const data = await varPromise('./assets/user.txt', 2000, 'users');
        const {users} = JSON.parse(data);
        return users
    }catch(e){
        return e
    }
}

let playlistPromiseCall = async() => {
    try{
        const data = await varPromise('./assets/data.txt', 3000, 'playlist');
        const {playlist} = JSON.parse(data);
        return playlist
    }catch(e){
        return e
    }
}

module.exports = {userPromiseCall, varPromise, playlistPromiseCall};