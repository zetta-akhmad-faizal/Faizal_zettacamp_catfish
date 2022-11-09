let {gql} = require('apollo-server-express');

let userTypeDefs = gql`
    enum roleUser{
        customer
        employer
    }
    enum statusUser{
        Active,
        Deleted
    }
    input userParams{
        _id:ID
        first_name:String
        last_name: String
        email: String
        password: String
        status: statusUser
        role: roleUser
        page: Int 
        limit: Int
    }
    type userScheme{
        _id: ID
        first_name:String
        last_name: String
        email: String
        password: String
        status: String
        role: roleUser
    }
    type responseAtUser{
        message: String
        data: userScheme
    }
    type responseAtUserList{
        message: String
        data: [userScheme]
    }
    type responseAtlogin{
        message: String
        token: String
    }
    type Mutation{
        CreateUser(data:userParams): responseAtUser
        Login(data:userParams): responseAtlogin
        UpdateUser(data: userParams): responseAtUser,
        DeleteUser(data: userParams): responseAtUser
    }
    type Query{
        getAllUsers(data:userParams): responseAtUserList
        getOneUser(data: userParams): responseAtUser
    }
`

module.exports = userTypeDefs