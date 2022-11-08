const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
    input userParams{
        _id:ID,
        email: String,
        password: String
    }
    type userType{
        _id:ID
        email:String,
        password:String
    }
    type responseAtUser{
        message: String,
        data: userType
    }
    type responseAtUsers{
        message: String,
        data: [userType]
    }
    type responseAtUsersId{
        message: String,
        data: userType
    }
    type responseUserLog{
        message: String,
        token:String
    }
    type Query{
        getListUser:responseAtUsers,
        getUserByid(data: userParams): responseAtUsersId
    }
    type Mutation{
        loginResolver(data: userParams):responseUserLog
        updateUser(data:userParams): responseAtUser,
        insertUser(data: userParams): responseAtUser
    }
`

module.exports = typeDefs