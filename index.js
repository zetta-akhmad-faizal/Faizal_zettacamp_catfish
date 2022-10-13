const data = require('./assets/data.json');

let {GroupSongArtist, GroupSongGenre, LessThanHour} = require('./src/day4');
LessThanHour(data);
// console.log(GroupSongGenre(data,'jazz'));
// console.log(GroupSongArtist(data,'charlie puth'));