const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
    enum choice{
        playlists
        song
    }
    input playlistParams{
        delete_choice: choice,
        playlistId: ID,
        songId: ID
    }
    type playlistField{
        song_id: songScheme,
        duration: String
    }
    type totalDurationField{
        hours: String,
        minutes: String,
        seconds: String
    }
    type playlistsSchema{
        name: String,
        playlist: [playlistField],
        total_duration: totalDurationField,
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
    input nameFieldParams{
        name: String
    }
    type Mutation{
        insertPlaylist(data: nameFieldParams):responseAtPlaylist,
        updatePlaylist(data: songParams):responseAtPlaylist,
        deletePlaylist(data: playlistParams): responseAtPlaylist,
    }
    type Query{
        getAllPlaylist(data: songParams): responseAtPaginationPlaylists
    }
`

module.exports = typeDefs;