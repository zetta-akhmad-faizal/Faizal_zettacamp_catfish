const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const {userPromiseCall} = require('./another')
dotenv.config()

let userFind = async(auth) => {
    let data = await userPromiseCall();
    let users = data.find(({id}) => id === auth._id);
    return users
}

let authorization = async(req, res, next) => {
    try{
        let header = req.header('Authorization');
        if(header === undefined){
            res.status(401).send({
                status:401,
                message:"Token Bearer unreadable"
            })
        }
        const token = header.replace('Bearer ', '');
        const auth = jwt.verify(token, process.env.SECRET_TOKEN);
        const user = await userFind(auth);
        
        req.user = user;
        next();

    }catch(e){
        res.status(400).send({
            status:400,
            message: "Token is expires or Token problem"
        })
    }
}

module.exports = authorization;