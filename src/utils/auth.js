const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const {users} = require('../model/index');
dotenv.config();

let dataUser = async (usr, autho) => {
    let data = await usr.findOne({_id: autho._id});
    return data
}

const authorization = async(req) => {
    try{
        let header = req.header('Authorization')
        if(req.header('Authorization') === undefined){
            return{
                user: [],
                message:"Token Bearer unreadable"
            }
        }
        const token = header.replace('Bearer ', '');
        const authUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await dataUser(users, authUser);
        // req.user = user;

        return {message:"Authorization success", user}
    }catch(e){
        return { message: "User unAuthorized", user: []}
    }
}

module.exports = authorization;