const {playlistPromiseCall} = require('./another');
const {songModel} = require("./models/index")

let randomArray = (arrays) => {
    let arrSet = new Set(arrays);
    let [...arrPlaylist] = arrSet;
    let arr = [];
    while(arrPlaylist.length !== 0){
        let randomIndex = Math.floor(Math.random() * arrPlaylist.length);
        arr.push(arrPlaylist[randomIndex]);
        arrPlaylist.splice(randomIndex, 1);
    }
    arrPlaylist = arr;
    return arrPlaylist;
}

let LessThanHour = async() => {
    let index = 0;
    let jam=0;let menit=0;let detik=0;
    let newMap = new Map();
    let newArr = [];arrMenit=[]; arrDetik=[]; arrJam=[]

    let playlist = await songModel.aggregate([
        {
            $project: {
                _id: 1,
                duration: 1
            }
        }
    ]); 
    playlist = randomArray(playlist)

    if(playlist.length < 1){
        return 'Music playlist doesnt'
    }

    for(index; index < playlist.length;index++){
        let splitter = playlist[index].duration.split(":");
        let [hour, minute, second] = splitter;

        if(parseInt(second) < 1){
            detik += 0;
        }else if(parseInt(second) > 59){
            detik = parseInt(detik) - 59;
            menit += 1
        }else{
            detik += parseInt(second)
        }

        if(parseInt(minute) < 1){
            menit += 0;
        }else if(parseInt(minute) > 59){
            menit = parseInt(minute) - 59;
            jam += 1;
        }else{
            menit += parseInt(minute)
        }

        parseInt(hour) < 1 ? jam += 0 : jam += parseInt(hour)

        if(detik > 59){
            detik -= 60;
            menit += 1;
        }

        if(menit > 59){
            menit -= 59;
            jam += 1;
        }

        if(jam < 1){
            arrJam.push(jam)
            arrMenit.push(menit);
            arrDetik.push(detik)
            newArr.push(playlist[index]);
        }
    }
    

    newArr.map((val) => {
        val.song_id = val._id;
        delete val._id
    })
    newMap.set("music", newArr);

    return [Object.fromEntries(newMap), arrJam, arrMenit, arrDetik]
}

module.exports = {LessThanHour, playlistPromiseCall};