const {playlistPromiseCall} = require('./another');

let GroupSongArtist = async(vocalist) => {
    let data = await playlistPromiseCall();
    let getArtist = data.filter(({artist}) => artist.toUpperCase() === vocalist.toUpperCase());
    if(getArtist.length === 0){
        return {
            status: 404,
            message: `${vocalist} is not found`
        };
    }
    return {
        status: 200,
        message: getArtist
    };
}

let GroupSongGenre = async(genres) => {
    let data = await playlistPromiseCall();
    let getGenre = data.filter(({genre}) => genre.toUpperCase() === genres.toUpperCase());
    if(getGenre.length === 0){
        return {
            status: 404,
            message: `${genres} is not found`
        };
    }
    return {
        status: 200,
        message: getGenre
    };
}

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
    let newArr = [];

    let playlist = await playlistPromiseCall(); 
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
            newArr.push(playlist[index]);
            newMap.set("music", newArr);
            newMap.set("total_duration",`${menit} minute ${detik} second`)
        }
    }
    
    return Object.fromEntries(newMap)
}

module.exports = {GroupSongArtist,GroupSongGenre,LessThanHour};