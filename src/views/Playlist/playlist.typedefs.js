const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
    type playlistField{
        song_id: ID,
        duration: String
    }
    type totalDurationField{
        hours: {type: Number},
        minutes: {type:Number},
        seconds: {type:Number}
    }
    type playlistsSchema{
        playlist: [playlistField],
        total_duration: total_duration
    }
    type responseAtPlaylist{
        message:String,
        data: playlistsSchema
    }
    type Mutation{
        insertPlaylist:responseAtPlaylist,
        updatePlaylist:responseAtPlaylist,
        deletePlaylist:responseAtPlaylist,
    }
    type Query{
        getAllPlaylist: responseAtPlaylist
    }
`

module.exports = typeDefs;