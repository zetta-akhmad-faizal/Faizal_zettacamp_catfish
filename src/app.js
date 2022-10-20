const {playlistPromiseCall} = require('./another');

let randomArray = (arrays) => {
    let arr = []
    while(arrays.length !== 0){
        let randomIndex = Math.floor(Math.random() * arrays.length);
        arr.push(arrays[randomIndex]);
        xarrays.splice(randomIndex, 1);
    }
    arrays = arr;
    return arrays;
}

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

let LessThanHour = async() => {
    let index = 0;
    let jam=0;let menit=0;let detik=0;

    let playlist = await playlistPromiseCall(); 
    playlist = randomArray(playlist)

    for(index; index < playlist.length;index++){
        let splitter = playlist[index].duration.split(":");
        let [hour, minute, second] = splitter;
        let newMap = new Map();

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
            return {
                music: playlist[index],
                duration: `${menit} minute ${detik} second`
            }
            // remainTime = (playlist.length-1) -i;
            // remainMin = 59 - menit;
        }
    }
    // let remaining = playlist.slice(playlist.length-remainTime, playlist.length);
    // for(let b=0;b<remaining.length;b++){
    //     let [h, m, s] = remaining[b].duration.split(':');
    //     if(parseInt(m) < remainMin){
    //         detik += parseInt(s);
    //         console.log('Recommended: ',remaining[b]);
    //     }
    // }
}

module.exports = {GroupSongArtist,GroupSongGenre,LessThanHour};