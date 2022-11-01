const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const {userModel} = require('../models/index');
dotenv.config()

let userFind = async(usr, auth) => {
    let users = await usr.findOne({_id: auth._id})
    return users
}

let authorization = async(req, res, next) => {
    try{
        let header = req.header('Authorization')
        if(req.header('Authorization') === undefined){
            res.status(401).send({
                status:401,
                message:"Token Bearer unreadable"
            })
        }
        const token = header.replace('Bearer ', '');
        const authUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await userFind(userModel, authUser);
       
        req.user = user;
        next()
    }catch(e){
        res.status(400).send({
            status:401,
            message: "User UnAuthorized"
        })
    }
}

module.exports = authorization;