// Here the User Class is defined
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    login_id: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const Users = mongoose.model('Users', UsersSchema, 'users');
module.exports = Users;