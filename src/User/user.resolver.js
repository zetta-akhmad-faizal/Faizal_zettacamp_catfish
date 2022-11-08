const {userModel} = require('./user.model');
const {GraphQLError} = require('graphql');
const {hash, compare} = require('bcrypt');
const {mongoose} = require('mongoose');
const jwt = require('jsonwebtoken')

const insertUsers = async(parent, {data:{first_name, last_name, email, password, role}}, ctx) => {
    try{
        password = await hash(password, 10)
        let insertQueries = new userModel({
            first_name, last_name, email, password, role
        })
        let validator = insertQueries.validateSync();
        if(validator){
            return {message: validator.errors['email'].message}
        }else{
            insertQueries.save()
            return {message: "Data is saved", data: insertQueries}
        }
    }catch(e){
        throw new GraphQLError("insertUser function is error")
    }
}

const getAllUsers = async(parent, {data: {email, last_name, first_name}}, ctx) => {
    let arr = []
    if(first_name && !last_name && !email){
        arr.push(
            {
                $match: {
                    first_name
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(last_name && !email && !first_name){
        arr.push(
            {
                $match: {
                    last_name
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(email && !first_name && !last_name){
        arr.push(
            {
                $match: {
                    email
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(email && last_name && !first_name){
        arr.push(
            {
                $match: {
                    last_name
                }
            },
            {
                $match: {
                    email
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(email && first_name && !last_name){
        arr.push(
            {
                $match: {
                    first_name
                }
            },
            {
                $match: {
                    email
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(first_name && last_name && !email){
        arr.push(
            {
                $match: {
                    first_name,
                }
            },
            {
                $match:{
                    last_name
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(email && last_name && first_name){
        arr.push(
            {
                $match: {
                    first_name,
                }
            },
            {
                $match: {
                    last_name,
                }
            },
            {
                $match: {
                    email
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else{
        arr.push({
            $sort: {
                createdAt: -1
            }
        })
    }

    const queryGetUser = await userModel.aggregate(arr);

    return {message: "Data is displayed", data: queryGetUser}
}

const userLogin = async(parent, {data:{email, password}}, ctx) => {
    let queries = await userModel.findOne({email});
    if(queries.status === 'deleted'){
        return {message: "User has been deleted"}
    }
    if (!queries) {
        return {
            message: "User not found"
        }
    }else{
        let token = jwt.sign({
            _id: queries._id
        }, process.env.TOKEN_SECRET, {
            expiresIn: '2h'
        });

        let queriesHash = await compare(password, queries.password);
        
        if(!queriesHash){
            return {message: "Password incorrect"}
        }else{
            return {
                message: "You're authorized",
                token
            }
        }
    }
}

const getOneUser = async(parent, {data:{_id, email}}, ctx) => {
    let queries;
    if(_id){
        let converterId = mongoose.Types.ObjectId(_id);
        queries = await userModel.findById(converterId);
        if(!queries){
            return {message: `User ${_id} isn't fetched`}
        }
        return {message: `User ${_id} is fetched`, data: queries}
    }else if(email){
        queries = await userModel.findOne({email});
        if(!queries){
            return {message: `User ${email} isn't fetched`}
        }
        return {message: `User ${email} is fetched`, data: queries}
    }
    if(!email && !_id){
        return {message: "This function filtering only"}
    }
}

module.exports = {
    Mutation: {
        insertUsers,
        userLogin
    }, 
    Query: {
        getAllUsers,
        getOneUser
    }
}