let GroupSongArtist = ({playlist} ,vocalist) => {
    let getArtist = playlist.filter(({artist}) => artist === vocalist);
    return getArtist;
}

let GroupSongGenre = ({playlist} ,genres) => {
    let getGenre = playlist.filter(({genre}) => genre === genres);
    return getGenre;
}

let LessThanHour = ({playlist}) => {
    let i = 0
    let jam=0;let menit=0;let detik=0

    for(i; i < playlist.length;i++){
        let splitter = playlist[i].duration.split(":");
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

        if(parseInt(hour) < 1){
            jam += 0
        }else{
            jam += parseInt(hour);
        }

        if(detik > 59){
            detik -= 60;
            menit += 1;
        }

        if(menit > 59){
            menit -= 59;
            jam += 1;
        }

        if(jam < 1){
            console.log(playlist[i]);
            if(detik < 10){
                console.log(`Time duration [${jam}:${menit}:0${detik}]`)
            }
        }
    }
}

module.exports = {GroupSongArtist,GroupSongGenre,LessThanHour};