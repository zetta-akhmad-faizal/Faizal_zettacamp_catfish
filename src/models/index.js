const {mongoose, Schema} = require('./app');

mongoose.connect("mongodb://127.0.0.1:27017/zettacampDB").then(() => console.log('Çonnect')).catch((err) => console.log(err.message));

const userSchema = new Schema({
    email: {type: String, required: true,},
    password: {type: String, required: true,trim:true, minlength: 8},
})

const songSchema = new Schema({
    title: {type:String},
    duration: {type:String},
    artist: {type:String},
    genre: {type:String},
    user_id: {type:mongoose.Schema.Types.ObjectId, required:true, trim:true, ref:'users'},
})

const playlistSchema = new Schema({
    name: {type: String},
    playlist: [
        {
            song_id: {type:mongoose.Schema.Types.ObjectId, ref:'songs'},
            duration: {type:String},
        }
    ],
    total_duration: {
        hours: {type: Number},
        minutes: {type:Number},
        seconds: {type:Number}
    }
})

playlistSchema.set('timestamps', true);
songSchema.set("timestamps", true);
userSchema.set("timestamps", true)

let songModel = mongoose.model('songs', songSchema);
let userModel = mongoose.model('users', userSchema);
let playlistModel = mongoose.model('playlists', playlistSchema);

userSchema.virtual('songs', {
    ref: 'songs',
    localField: '_id',
    foreignField: 'user_id'
})

songSchema.virtual('playlists', {
    ref: 'playlists',
    localField: '_id',
    foreignField: 'playlist.song_id'
})

module.exports = {userModel, songModel, playlistModel}