const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
    input userParams{
        email: String,
        password: String
    }
    type userType{
        email:String,
        password:String
    }
    type responseAtUser{
        message: String,
        data: userType
    }
    type Mutation{
        loginResolver(data: userParams): responseAtUser
        updateUser(data:userParams): responseAtUser,
        insertUser(data: userParams): responseAtUser
    }
`

module.exports = typeDefs