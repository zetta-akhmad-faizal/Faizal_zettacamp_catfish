const {userModel} = require('../../models/index');
const {hash, compare} = require('bcrypt')
const jwt = require('jsonwebtoken');

const loginResolver = async(parent, {data:{email, password}}) => {
    let queries = await userModel.findOne({email});
    
    if (!queries) {
        return {
            message: "User not found"
        }
    }else{
        let token = jwt.sign({
            _id: queries._id
        }, process.env.TOKEN_SECRET, {
            expiresIn: '2h'
        });
        let queriesHash = await compare(password, queries.password);
        if(!queriesHash){
            return {message: "Password incorrect"}
        }else{
            return {
                message: "You're authorized",
                token
            }
        }
    }
}

const getListUser=async(parent,args)=>{
    const queriesGetAll = await userModel.find({})
    return {message:"Users is listed", data:queriesGetAll}
}

const updateUser=async(parent, args)=>{}

const insertUser = async(parent, {data: {email, password}}, ctx) => {
    const queriesCheckUser = await userModel.findOne({email});
    if(queriesCheckUser){
        return {message: "Email has been used"}
    }else{
        password = await hash(password, 10)
        let queriesInsert = new userModel({email, password});
        queriesInsert.save()
        return {
            message: "You're registered",
            data: queriesInsert
        }
    }
}

module.exports = {
    Query:{
        getListUser
    },
    Mutation: {
        loginResolver,
        updateUser,
        insertUser
    }
}