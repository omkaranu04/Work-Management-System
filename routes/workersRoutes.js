// Importing required modules
const express = require('express'); // Importing Express.js framework
const Workers = require('../models/workers'); // Importing Workers model
const { result } = require('lodash'); // Importing lodash for utility functions
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const Works = require('../models/works'); // Importing Works model

// Creating a router instance
const router = express.Router();

// Using body-parser middleware to parse JSON request bodies
router.use(bodyParser.json());

// METHOD FOR GETTING ALL THE WORKERS IN DATABASE AND DISPLAYING THEM ON A PAGE
router.get('/workers', (req, res) => {
    // Finding all workers in the database
    Workers.find()
        .then((workers) => {
            // Rendering the 'worker_display' template with the workers data
            res.render('worker_display', { workers: workers });
        })
        .catch((err) => {
            console.log(err);
        })
});

// METHOD FOR ADDING WORKERS TO THE DATABASE
router.post('/workers', (req, res) => {
    const { name, age, gender, role, worker_id, skill_level } = req.body;

    // Set active to false by default
    const active = false;

    // Creating a new Worker instance with the provided data
    const worker = new Workers({
        name: name,
        age: age,
        gender: gender,
        role: role,
        active: active, // Assigning the default value
        worker_id: worker_id,
        skill_level: skill_level // Adding the skill_level attribute
    });

    // Saving the new worker to the database
    worker.save()
        .then((result) => {
            res.redirect('/workers');
        })
        .catch((err) => {
            console.error(err);
        });
});

// Route to render the form for adding a new worker
router.get('/workers/add', (req, res) => {
    res.render('add_worker');
});

// Route to display the form for editing a specific worker
router.get('/worker/edit/:id', (req, res) => {
    // Extracting worker ID from request parameters
    const workerId = req.params.id;
    // Finding the worker by ID
    Workers.findById(workerId)
        .then((worker) => {
            // Rendering the 'worker_edit' template with the worker data
            if (!worker) {
                res.status(404).send('Worker not found');
            } else {
                res.render('worker_edit', { worker: worker });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// Route to handle updating a worker's details (POST request)
router.post('/worker/edit/:id', (req, res) => {
    // Extracting worker ID from request parameters
    const workerId = req.params.id;
    const { name, age, gender, role, worker_id, active, skill_level } = req.body;

    // Updating the worker details in the database
    Workers.findByIdAndUpdate(workerId, {
        name: name,
        age: age,
        gender: gender,
        role: role,
        worker_id: worker_id,
        active: active,
        skill_level: skill_level // Adding the skill_level attribute
    })
        .then(() => {
            res.redirect('/workers');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// Route to handle updating a worker's details
router.put('/workers/:id', (req, res) => {
    // Extracting worker ID from request parameters
    const workerId = req.params.id;
    const { name, age, gender, role, worker_id, active, skill_level } = req.body;

    // Updating the worker details in the database
    Workers.findByIdAndUpdate(workerId, {
        name: name,
        age: age,
        gender: gender,
        role: role,
        worker_id: worker_id,
        active: active,
        skill_level: skill_level // Adding the skill_level attribute
    })
        .then(() => {
            res.redirect('/workers');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// Route to render the form for adding a new worker
router.get('/workers/add', (req, res) => {
    res.render('add_worker');
});

// DELETE request to delete a worker
router.delete('/workers/:id', async (req, res) => {
    const workerId = req.params.id;

    try {
        // Find the worker by ID
        const worker = await Workers.findById(workerId);

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        // Find works where this worker is assigned
        const worksToUpdate = await Works.find({ assigned_worker_ids: workerId });

        // Update each work to remove the worker's ID and decrement workers_assigned count
        await Promise.all(worksToUpdate.map(async (work) => {
            await Works.findByIdAndUpdate(work._id, {
                $pull: { assigned_worker_ids: workerId },
                $inc: { workers_assigned: -1 }
            });
        }));

        // Delete the worker from the collection
        await Workers.findByIdAndDelete(workerId);

        res.redirect('/workers'); // Redirect to '/workers' after successful deletion
    } catch (error) {
        console.error('Error deleting worker:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Router for handling freeing workers
router.put('/workers/free/:id', async (req, res) => {
    const workerId = req.params.id;

    try {
        // Find the worker by ID
        const worker = await Workers.findById(workerId);

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        // Update the active status to false
        worker.active = false;
        await worker.save();

        // Find the work associated with this worker
        const work = await Works.findOne({ assigned_worker_ids: { $in: [workerId] } });

        if (work) {
            // Remove the worker from the assigned_worker_ids array
            work.assigned_worker_ids = work.assigned_worker_ids.filter(id => id.toString() !== workerId);
            work.workers_assigned = work.assigned_worker_ids.length;
            await work.save();
        }
        // Redirect to the worker list page
        res.redirect('/workers');
    } catch (error) {
        console.error('Error freeing worker:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route for handling worker search by ID or name
router.get('/workers/search', async (req, res) => {
    const { workerId, workerName } = req.query;

    try {
        let workers = [];

        if (workerId) {
            // Find all workers with the given Worker ID
            workers = await Workers.find({ worker_id: workerId });
        } else if (workerName) {
            // Search for workers with the provided name
            workers = await Workers.find({ name: { $regex: new RegExp(workerName, 'i') } });
        }

        if (workers.length === 0) {
            // No worker found with the provided ID or name
            res.render('worker_display', { workers: [], message: 'No worker found' });
        } else {
            // Workers found, render the page with the workers
            res.render('worker_display', { workers });
        }
    } catch (err) {
        console.error('Error searching for workers:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Exporting the router to be used in the main application
module.exports = router;

