const exp = require('express');
const jwt = require('jsonwebtoken');
const authorization = require('./auth');
const {userPromiseCall} = require('./another');
const dotenv = require('dotenv');
const {GroupSongArtist,GroupSongGenre,LessThanHour} = require('./app');
dotenv.config()

const api = exp.Router();

api.post('/login', async(req, res) => {
    const {mail,psw} = req.body;
    const user = await userPromiseCall();
    try{
        const user_find = user.find(({email, password}) => email === mail && password === psw);
        if(!user_find){
            res.status(404).send({
                status: 404,
                message: 'User not found'
            })
        }else{
            let auth = jwt.sign({_id: user_find.id}, process.env.SECRET_TOKEN, {expiresIn: '1h'});
            res.status(201).send({
                status: 201,
                message: auth
            })
        }
    }catch(e){
        res.send(user)
    }
})

api.get('/GroupSongArtist/:artist', authorization, async(req, res) => {
    const {artist} = req.params;
    const data = await GroupSongArtist(artist);
    res.status(data.status).send(data);
})

api.get('/GroupSongGenre/:genre', authorization, async(req, res) => {
    const {genre} = req.params;
    console.log(genre)
    const data = await GroupSongGenre(genre);
    res.status(data.status).send(data);
})

api.get('/lessThanHour', authorization, async(req, res) => {
    const data = await LessThanHour();
    res.send(data)
})

module.exports = api;