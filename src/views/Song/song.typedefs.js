const {gql} = require('apollo-server-express')

const typeDefs = gql`
    type songScheme{
        title: String,
        duration: String,
        artist: String,
        genre: String,
        user_id: userType,
    }
    input songParams{
        _id: ID,
        title: String,
        duration: String,
        artist: String,
        genre: String,
        limit: Int,
        page: Int,
        name: String
    }
    type responseAtSong{
        message:String,
        data: songScheme
    }
    type paginationOfSongField{
        _id:ID,
        title: String,
        duration:String,
        artist:String,
        genre:String,
        user_id: userType,
        createdAt:String,
        updatedAt: String,
    }
    type totalOfSongField{
        count: Int
    }
    type paginationScheme{
        paginationOfSong: [paginationOfSongField],
        totalOfSong: [totalOfSongField]
    }
    type responseAtPagination{
        message: String,
        data: [paginationScheme]
    }
    type Query{
        getAllSong(data:songParams): responseAtPagination
    }
    type Mutation{
        insertSong(data: songParams):responseAtSong,
        updateSong(data:songParams):responseAtSong,
        deleteSong(data:songParams):responseAtSong,
    }
`

module.exports = typeDefs