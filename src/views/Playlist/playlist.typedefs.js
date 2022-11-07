const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
    type playlistField{
        song_id: ID,
        duration: String
    }
    type totalDurationField{
        hours: String,
        minutes: String,
        seconds: String
    }
    type playlistsSchema{
        playlist: [playlistField],
        total_duration: totalDurationField,
        user_id: userType,
        createdAt: String,
        updatedAt: String
    }
    type playlistCount{
        count:Int
    }
    type playlistPaginationSchema{
        paginationOfPlaylists: [playlistsSchema],
        totalOfPlaylists: [playlistCount]
    }
    type responseAtPlaylist{
        message:String,
        data: playlistsSchema
    }
    type responseAtPaginationPlaylists{
        message: String,
        data: [playlistPaginationSchema]
    }
    type Mutation{
        insertPlaylist:responseAtPlaylist,
        updatePlaylist:responseAtPlaylist,
        deletePlaylist:responseAtPlaylist,
    }
    type Query{
        getAllPlaylist(data: songParams): responseAtPaginationPlaylists
    }
`

module.exports = typeDefs;