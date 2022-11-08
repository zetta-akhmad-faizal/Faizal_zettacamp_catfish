const DataLoader = require('dataloader');
const {userModel} = require('../../models/index')

let userCallBack = async(userId) => {
    const user = await userModel.find({
        _id: {
            $in: userId
        }
    })
    const objVar = {};
    user.forEach(val => {
        objVar[val._id] = val;
    })
    console.log('userid',userId)
    return userId.map((id) => objVar[id]);
}

const userLoader = new DataLoader(userCallBack)
module.exports = userLoader