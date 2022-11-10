const {userModel} = require('./user.model');
const DataLoader = require('dataloader');

let userCall = async(userIds) => {
    let user = await userModel.find({
        _id: {
            $in: userIds
        }
    })

    let obj = {};
    user.forEach(val => {
        obj[val._id] = val
    })

    return userIds.map(id => obj[id]);
}

const userLoader = new DataLoader(userCall);

module.exports = userLoader