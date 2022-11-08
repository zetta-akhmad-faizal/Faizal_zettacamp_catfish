const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const {userModel} = require('../models/index');
const {GraphQLError} = require('graphql')
dotenv.config()

let authorization = async(resolver,parent, args, context) => {
    try{
        let token = context.req.get("Authorization")
        if(!token){
            throw new GraphQLError("Token is required");
        }else{
            const getToken = token.replace("Bearer ", "");
            const decode = jwt.verify(getToken, process.env.TOKEN_SECRET);
            const getUser = await userModel.findOne({_id: decode});
            context.user = getUser;
            context.token = getToken
        }
        return resolver();
    }catch(e){
        throw new GraphQLError("User UnAuthorized")
    }
}

module.exports = {
    Query: {
        getAllSong: authorization,
        getAllPlaylist: authorization,
        getPlaylistById: authorization
    },
    Mutation: {
        insertSong: authorization,
        updateSong: authorization,
        deleteSong: authorization,
        insertPlaylist: authorization,
        updatePlaylist: authorization,
        deletePlaylist: authorization,
        updateUser: authorization
    }
};