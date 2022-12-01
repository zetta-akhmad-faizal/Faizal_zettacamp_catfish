const {userModel, verificationModel} = require('./user.model');
const {GraphQLError} = require('graphql');
const {hash, compare} = require('bcrypt');
const {mongoose} = require('mongoose');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const randomstring = require("randomstring");
const dotenv = require('dotenv');
dotenv.config()

const CreateUser = async(parent, {data:{first_name, last_name, email, password, role, status}}, ctx) => {
    try{
        if(password){
            password = await hash(password, 10)
        }else{
            throw new GraphQLError("Password must be filled")
        }
        let generalPermit = [
            {
                name: "Home",
                slug: "home",
                view: true
            },
            {
                name: "Menu",
                slug: "menu",
                view: true
            },
            {
                name: "Profile",
                slug: "profile",
                view: true
            },
            {
                name: "Get Started",
                slug: "login",
                view: false
            }
        ]
        let usertype = [];
        if(role === 'Admin'){
            usertype.push(
                ...generalPermit,
                {
                    name: "Menu Management",
                    slug: "menu-management",
                    view: true
                },
                {
                    name: "Stock Management",
                    slug: "stock-management",
                    view: true
                },
            )
        }else if(role === 'User'){
            usertype.push(
                ...generalPermit,
                {
                    name: "Menu Management",
                    slug: "menu-management",
                    view: false
                },
                {
                    name: "Stock Management",
                    slug: "stock-management",
                    view: false
                }
            )
        }

        usertype.push(
            {
                name: "Cart",
                slug: "cart",
                view: true
            },
        )

        let insertQueries = new userModel({
            first_name, last_name, email, password, status, usertype, role
        })

        let validator = insertQueries.validateSync();

        if(validator){
            throw new GraphQLError(validator.errors['email'].message)
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
    console.log(email, password);
    let queries = await userModel.findOne({email, status: 'Active'});
    if (!queries) {
        throw new GraphQLError("User not found")
    }else{
        let token = jwt.sign({
            _id: queries._id
        }, process.env.TOKEN_SECRET, {
            expiresIn: '2h'
        });

        let queriesHash = await compare(password, queries.password);
        
        if(!queriesHash){
            throw new GraphQLError("Password incorrect")
        }else{
            return {
                message: "You're authorized",
                token,
                user: queries
            }
        }
    }
}

const getOneUser = async(parent, {data:{_id, email}}, ctx) => {
    let queries;

    if(_id){
        let converterId = mongoose.Types.ObjectId(_id);
        queries = await userModel.findOne({_id:converterId, status:"Active"});
        if(!queries){
            throw new GraphQLError(`User ${_id} isn't fetched`)
        }
        return {message: `User ${_id} is fetched`, data: queries}
    }else if(email){
        queries = await userModel.findOne({email, status: "Active"});
        if(!queries){
           throw new GraphQLError(`User ${email} isn't fetched`)
        }
        return {message: `User ${email} is fetched`, data: queries}
    }
    if(!email && !_id){
       throw new GraphQLError("This function filtering only")
    }
}

const UpdateUser = async(parent, {data:{email, credite, password}}, ctx) => {
    let setObj = {};
    let message;

    let emailReg = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if(email){
        let queryGetUser = await userModel.findOne({email, status: "Active"});
        // console.log(queryGetUser)
        if(queryGetUser){
            return {message: "Email has been used"}
        }
        if(!email.match(emailReg)){
            return {message: "Email incorrect"}
        }
        setObj.email = email
    }
    if(password){
        password = await hash(password, 10);
        setObj.password = password
    }
    if(credite){
        setObj.credite = ctx.user.credite + credite
        message = "Top Up is successfuly"
    }

    let updateQueries = await userModel.findOneAndUpdate(
        {_id: ctx.user._id, status: "Active"},
        {
            $set: setObj
        },
        {new: true}
    )
    if(!updateQueries){
        throw new GraphQLError("User isn't updated")
    }
    return {message, data: updateQueries}
}

const saveVerification = async(parent, {data: {email}}, ctx) => {
    if(!email){
        throw new GraphQLError("For sign your account, email is important");
    }

    let message;
    let generate = randomstring.generate(4);

    let userCheck = await userModel.findOne({email});

    if(!userCheck){
        throw new GraphQLError("Your account isn't found")
    }

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
        user: 'akhmadfaizal13@gmail.com',
        pass: `${process.env.PASS}`
        }
    });

    let mailOptions = {
        from: 'akhmadfaizal13@gmail.com',
        to: userCheck.email,
        subject: 'Verification forget password',
        text: `Please fill the form with this code:  ${generate}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });

    let savingCode = new verificationModel({code: generate, user_id: userCheck._id})
    await savingCode.save()
    message = "Verification code has been sent to your email"
        

    return {message, data:userCheck}
}

const ForgetPassword = async(parent, {data: {email ,code, password}}, ctx) => {
    if(!code || !password){
        throw new GraphQLError("Code and password field must be filled")
    }

    if(!email){
        throw new GraphQLError("Session is the end")
    }

    let new_password = await hash(password, 10);
    let checkUser = await userModel.findOne({email});
    let checkCode = await verificationModel.findOne({user_id: checkUser._id, code, isUsed:false})

    if(!checkCode){
        throw new GraphQLError("Code isn't detected")
    }
    await userModel.updateOne(
        {email},
        {
            $set: {
                password: new_password
            }
        }
    )

    return {message: "Password is changed"}
}

const DeleteUser = async(parent, {data: {_id}}, ctx) => {
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
            throw new GraphQLError("User isn't found")
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
        DeleteUser,
        saveVerification,
        ForgetPassword 
    }, 
    Query: {
        getAllUsers,
        getOneUser
    },
    transactionScheme: {
        user_id: userLoaders
    }
}