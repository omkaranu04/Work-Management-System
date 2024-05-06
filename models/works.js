// HERE THE WORKS CLASS IS DEFINED
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const worksSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    required_no_of_workers: {
        type: Number,
        required: true
    },
    workers_assigned: {
        type: Number,
        required: true
    },
    duration_in_days: {
        type: Number,
        required: true
    },
    priority: {
        type: Number,
        required: true
    },
    completion_status: {
        type: Boolean,
        required: true
    },
    work_type: {
        type: String,
        required: true
    },
    assigned_worker_ids: [{ type: Schema.Types.ObjectId, ref: 'Worker' }],
    date: {
        type: Date,
        required: true
    }
}, { timestamps: true })

const Works = mongoose.model('Works', worksSchema, 'works');
module.exports = Works;