const {gql} = require('apollo-server-express')

const typeDefs = gql`
    type songScheme{
        title: String,
        duration: String,
        artist: String,
        genre: String,
        user_id: ID,
    }
    input songParams{
        title: String,
        duration: String,
        artist: String,
        genre: String,
        user_id: ID,
    }
    type responseAtSong{
        message:String,
        data: songScheme
    }
    type Query{
        getAllSong: responseAtSong
    }
    type Mutation{
        insertSong(data: songParams):responseAtSong,
        updateSong(data:songParams):responseAtSong,
        deleteSong(data:songParams):responseAtSong,
    }
`

module.exports = typeDefs