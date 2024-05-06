// HERE THE WORKER CLASS IS DEFINED
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workersSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    worker_id: {
        type: Number,
        required: true
    },
    skill_level: {
        type: String,
        enum: ['expert', 'intermediate', 'beginner'],
        required: true
    }
}, { timestamps: true })

const Workers = mongoose.model('Workers', workersSchema, 'workers');
module.exports = Workers;