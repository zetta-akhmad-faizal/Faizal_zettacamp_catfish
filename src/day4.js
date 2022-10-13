let GroupSongArtist = ({playlist} ,vocalist) => {
    let getArtist = playlist.filter(({artist}) => artist === vocalist);
    return getArtist;
}

let GroupSongGenre = ({playlist} ,genres) => {
    let getGenre = playlist.filter(({genre}) => genre === genres);
    return getGenre;
}

let LessThanHour = ({playlist}) => {
    let startAt = 0;let timeStr = '';let i = 0
    for(i; i < playlist.length;i++){
        let splitter = playlist[i].duration.split(":");
        let [hour, minute, second] = splitter;
        if(parseInt(hour) < 1){
            timeStr = '';
        }else{
            timeStr += hour;
        }
        if(parseInt(minute) < 1){
            timeStr += '00';
        }else{
            timeStr += minute;
        }
        if(parseInt(second) < 1){
            timeStr += '00';
        }else{
            timeStr += second;
        }
        startAt += parseInt(timeStr);
        if(startAt <= 6000){
            console.log(playlist[i]);
            // console.log(i);
        }
    }
    // console.log(playlist.length)
}

module.exports = {GroupSongArtist,GroupSongGenre,LessThanHour};