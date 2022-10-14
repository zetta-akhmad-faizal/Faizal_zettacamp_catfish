const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const {users} = require('../assets/user.json');
dotenv.config();

const authorization = async(req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const authUser = jwt.verify(token, process.env.SECRET_TOKEN);
        const user = await users.find(({id}) => id === authUser._id);
       
        if(!user){
            res.status(401).send({
                status:401,
                message:'User unauthorized'
            })
        }
        req.user = user;
        next()
    }catch(e){
        res.status(400).send({
            status:400,
            message: e.message
        })
    }
}

module.exports = authorization;