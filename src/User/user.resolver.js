const {userModel} = require('./user.model');
const {GraphQLError} = require('graphql');
const {hash, compare} = require('bcrypt');
const {mongoose} = require('mongoose');
const jwt = require('jsonwebtoken')

const CreateUser = async(parent, {data:{first_name, last_name, email, password, role, status}}, ctx) => {
    try{
        if(password){
            password = await hash(password, 10)
        }else{
            return {message: "Password must be filled"}
        }

        let insertQueries = new userModel({
            first_name, last_name, email, password, role, status
        })

        let validator = insertQueries.validateSync();

        if(validator){
            return {message: validator.errors['email'].message}
        }

        await insertQueries.save()
        return {message: "User is saved", data: insertQueries}
    }catch(e){
        throw new GraphQLError("Email has been used")
    }
}

const getAllUsers = async(parent, {data: {email, last_name, first_name, page, limit}}, ctx) => {
    let firstNameRegex;let lastNameRegex; let emailRegex;

    let arr = [];
    let skip = page > 0 ? ((page -1 ) * limit) : 0;
    // console.log(ctx.user)
    if(ctx.user.role === 'customer'){
        return {message: "You dont have access to getAllUsers function"}
    }
    if(page && limit && !last_name && !email && !first_name){
        arr.push(
            {
                $match: {
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(page && limit && first_name && !last_name && !email){
        firstNameRegex = new RegExp(first_name, 'i');
        arr.push(
            {
                $match: {
                    first_name: firstNameRegex,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(page && limit && last_name && !email && !first_name){
        lastNameRegex = new RegExp(last_name, 'i');
        arr.push(
            {
                $match: {
                    last_name: lastNameRegex,
                    status: "Active"
                    
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(page && limit && email && !first_name && !last_name){
        emailRegex = new RegExp(email, 'i');
        arr.push(
            {
                $match: {
                    email: emailRegex,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(page && limit && email && last_name && !first_name){
        emailRegex = new RegExp(email, 'i');
        lastNameRegex = new RegExp(last_name, 'i');
        arr.push(
            {
                $match: {
                    last_name: lastNameRegex,
                    email: emailRegex,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(page && limit && email && first_name && !last_name){
        firstNameRegex = new RegExp(first_name, 'i');
        emailRegex = new RegExp(email, 'i');
        arr.push(
            {
                $match: {
                    first_name: firstNameRegex,
                    email: emailRegex,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(page && limit && first_name && last_name && !email){
        firstNameRegex = new RegExp(first_name, 'i');
        lastNameRegex = new RegExp(last_name, 'i');
        arr.push(
            {
                $match: {
                    first_name: firstNameRegex,
                    last_name: lastNameRegex,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else if(page && limit && email && last_name && first_name){
        firstNameRegex = new RegExp(first_name, 'i');
        lastNameRegex = new RegExp(last_name, 'i');
        emailRegex = new RegExp(email, 'i');
        arr.push(
            {
                $match: {
                    first_name: firstNameRegex,
                    last_name: lastNameRegex,
                    email:emailRegex,
                    status: "Active"
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
    }else{
        arr.push(
            {
                $match: {
                    status: "Active"
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        )
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
    if(ctx.user.role === 'customer'){
        return {message: "You dont have access to getOneUser function"}
    }

    if(_id){
        let converterId = mongoose.Types.ObjectId(_id);
        queries = await userModel.findOne({_id:converterId, status:"Active"});
        if(!queries){
            return {message: `User ${_id} isn't fetched`}
        }
        return {message: `User ${_id} is fetched`, data: queries}
    }else if(email){
        queries = await userModel.findOne({email, status: "Active"});
        if(!queries){
            return {message: `User ${email} isn't fetched`, data: queries}
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
    if(!updateQueries){
        return {message: "User isn't updated", data: updateQueries}
    }
    return {message: "User is updated", data: updateQueries}
}

const DeleteUser = async(parent, {data: {_id}}, ctx) => {
    if(ctx.user.role === 'customer'){
        return {message: "You dont have access to DeleteUser function"}
    }

    if(_id){
        let converterId = mongoose.Types.ObjectId(_id);
        const deleteQueries = await userModel.findOneAndUpdate(
            {_id: converterId, status: "Active"},
            {
                $set: {
                    status: "Deleted"
                }
            },
            {new:true}
        )
        if(!deleteQueries){
            return {message: "User isn't found", data: deleteQueries}
        }
        return {message: "User is deleted", data:deleteQueries}
    }
}

const userLoaders = async(parent, args, ctx) => {
    if(parent){
        return await ctx.userLoader.load(parent.user_id);
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
    },
    transactionScheme: {
        user_id: userLoaders
    }
}