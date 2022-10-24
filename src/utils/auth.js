const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const {users} = require('../model/index');
dotenv.config();

let dataUser = async (usr, autho) => {
    let data = await usr.findOne({_id: autho._id});
    return data
}

const authorization = async(req, res, next) => {
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
        const user = await dataUser(users, authUser);
       
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