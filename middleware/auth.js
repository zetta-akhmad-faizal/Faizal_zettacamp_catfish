const {userModel} = require("../src/User/user.model");
const {GraphQLError} = require('graphql');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const e = require("express");

dotenv.config()

const Authorization = async(resolver, parent, args, ctx) => {
    try{
        let token = ctx.req.get("Authorization")
        if(!token){
            throw new GraphQLError("It need a token");
        }else{
            let getToken = token.replace("Bearer ", "");
            let verifyJWT = jwt.verify(getToken, process.env.TOKEN_SECRET);
            let userQueries = await userModel.findOne({_id: verifyJWT});
            if(!userQueries){
                throw new GraphQLError("User's not found");
            }else{
                ctx.user = userQueries;
                ctx.token = getToken
            }
        }
        return resolver()
    }catch(e){
        throw new GraphQLError("User unAuthorized");
    }
}

module.exports = {
    Query: {
        getAllUsers: Authorization,
        getOneUser: Authorization,
        GetAllIngredients: Authorization,
        GetOneIngredient: Authorization
    },
    Mutation: {
        UpdateUser: Authorization,
        DeleteUser: Authorization,
        CreateIngredient: Authorization,
        UpdateIngredient: Authorization,
        DeleteIngredient: Authorization
    }
}