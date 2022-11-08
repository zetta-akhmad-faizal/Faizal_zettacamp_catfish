const {userModel} = require('./user.model');
const {GraphQLError} = require('graphql');
const {hash, compare} = require('bcrypt');
const {mongoose} = require('mongoose');
const jwt = require('jsonwebtoken')

const CreateUser = async(parent, {data:{first_name, last_name, email, password, role, status}}, ctx) => {
    try{
        let queryGetUser = await userModel.findOne({email})
        if(queryGetUser){
            return {message: "Email has been used"}
        }
        password = await hash(password, 10)
        let insertQueries = new userModel({
            first_name, last_name, email, password, role, status
        })
        let validator = insertQueries.validateSync();
        if(validator){
            return {message: validator.errors['email'].message}
        }else{
            insertQueries.save()
            return {message: "Data is saved", data: insertQueries}
        }
    }catch(e){
        throw new GraphQLError(e.message)
    }
}

const getAllUsers = async(parent, {data: {email, last_name, first_name}}, ctx) => {
    let firstNameRegex;let lastNameRegex; let emailRegex;

    let arr = [];

    if(first_name && !last_name && !email){
        firstNameRegex = new RegExp(first_name, 'i');
        arr.push(
            {
                $match: {
                    first_name: firstNameRegex
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(last_name && !email && !first_name){
        lastNameRegex = new RegExp(last_name, 'i');
        arr.push(
            {
                $match: {
                    last_name: lastNameRegex
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(email && !first_name && !last_name){
        emailRegex = new RegExp(email, 'i');
        arr.push(
            {
                $match: {
                    email: emailRegex
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(email && last_name && !first_name){
        emailRegex = new RegExp(email, 'i');
        lastNameRegex = new RegExp(last_name, 'i');
        arr.push(
            {
                $match: {
                    last_name: lastNameRegex
                }
            },
            {
                $match: {
                    email: emailRegex
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(email && first_name && !last_name){
        firstNameRegex = new RegExp(first_name, 'i');
        emailRegex = new RegExp(email, 'i');
        arr.push(
            {
                $match: {
                    first_name: firstNameRegex
                }
            },
            {
                $match: {
                    email: emailRegex
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(first_name && last_name && !email){
        firstNameRegex = new RegExp(first_name, 'i');
        lastNameRegex = new RegExp(last_name, 'i');
        arr.push(
            {
                $match: {
                    first_name: firstNameRegex,
                }
            },
            {
                $match:{
                    last_name: lastNameRegex
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(email && last_name && first_name){
        firstNameRegex = new RegExp(first_name, 'i');
        lastNameRegex = new RegExp(last_name, 'i');
        emailRegex = new RegExp(email, 'i');
        arr.push(
            {
                $match: {
                    first_name: firstNameRegex,
                }
            },
            {
                $match: {
                    last_name: lastNameRegex,
                }
            },
            {
                $match: {
                    email:emailRegex
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

const Login = async(parent, {data:{email, password}}, ctx) => {
    let queries = await userModel.findOne({email, status: 'Active'});
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

const UpdateUser = async(parent, {data:{_id, email, first_name, last_name, password}}, ctx) => {
    if(!_id){
        return {message: "_id is null"}
    }
    
    let emailReg = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if(email){
        let queryGetUser = await userModel.findOne({email});
        console.log(queryGetUser)
        if(queryGetUser){
            return {message: "Email has been used"}
        }
        if(!email.match(emailReg)){
            return {message: "Email incorrect"}
        }
    }
    if(password){
        password = await hash(password, 10);
    }
    let converterId = mongoose.Types.ObjectId(_id)
    let updateQueries = await userModel.findOneAndUpdate(
        {_id: converterId},
        {
            $set: {
                email,
                first_name,
                last_name,
                password
            }
        },
        {new: true}
    )
    return {message: "Data is updated", data: updateQueries}
}

const DeleteUser = async(parent, {data: {_id}}, ctx) => {
    if(_id){
        let converterId = mongoose.Types.ObjectId(_id);
        const deleteQueries = await userModel.findOneAndUpdate(
            {_id: converterId},
            {
                $set: {
                    status: "Deleted"
                }
            },
            {new:true}
        )
        if(!deleteQueries){
            return {message: "Data isn't found"}
        }
        return {message: "Data is deleted", data:deleteQueries}
    }
}

module.exports = {
    Mutation: {
        CreateUser,
        Login,
        UpdateUser,
        DeleteUser
    }, 
    Query: {
        getAllUsers,
        getOneUser
    }
}