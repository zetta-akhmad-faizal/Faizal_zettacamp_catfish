let {gql} = require('apollo-server-express');

let userTypeDefs = gql`
    enum roleUser{
        customer
        employer
    }
    input userParams{
        _id:ID,
        first_name:String,
        last_name: String,
        email: String,
        password: String,
        status: String,
        role: roleUser,
    }
    type userScheme{
        _id: ID,
        first_name:String,
        last_name: String,
        email: String,
        password: String,
        status: String,
        role: roleUser
    }
    type responseAtUser{
        message: String,
        data: userScheme
    }
    type responseAtUserList{
        message: String,
        data: [userScheme]
    }
    type responseAtlogin{
        message: String,
        token: String
    }
    type Mutation{
        insertUsers(data:userParams): responseAtUser,
        userLogin(data:userParams): responseAtlogin
    }
    type Query{
        getAllUsers(data:userParams): responseAtUserList,
        getOneUser(data: userParams): responseAtUser
    }
`

module.exports = userTypeDefs