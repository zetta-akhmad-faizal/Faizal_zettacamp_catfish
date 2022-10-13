const data = require('./assets/data.json');

let {GroupSongArtist, GroupSongGenre, LessThanHour} = require('./src/day4');
console.log(LessThanHour(data));
// console.log(GroupSongGenre(data,'Pop'));
// console.log(GroupSongArtist(data,'James Arthur'));