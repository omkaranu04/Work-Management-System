// Importing necessary modules
const express = require('express');
const Works = require('../models/works');
const bodyParser = require('body-parser');
const Workers = require('../models/workers');

// Creating a router instance
const router = express.Router();
router.use(bodyParser.json());

// Route to get all works from the database and render them on a page
router.get('/works', (req, res) => {
    Works.find().sort({ priority: 1 })
        .then((works) => {
            res.render('work_display', { works: works });
        })
        .catch((err) => {
            console.log(err);
        })
});

// Route to add new works to the database
router.post('/works', (req, res) => {
    // Extracting work details from the request body, including the new 'date' attribute
    const { name, required_no_of_workers, duration_in_days, priority, work_type, date } = req.body;

    // Creating a new work instance with the extracted details
    const work = new Works({
        name: name,
        required_no_of_workers: required_no_of_workers,
        workers_assigned: 0, // Set assigned workers to 0 by default
        duration_in_days: duration_in_days,
        priority: priority,
        completion_status: false, // Set completion status to false by default
        work_type: work_type,
        assigned_worker_ids: [], // Set assigned worker array to empty by default
        date: new Date(date) // Convert date string to Date object
    });

    // Saving the new work instance to the database
    work.save()
        .then((result) => {
            res.redirect('/works');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
});

// Route to render the form for adding new works
router.get('/works/add', (req, res) => {
    res.render('add_work');
});

// Route to render the form for editing a specific work
router.get('/works/edit/:id', (req, res) => {
    const workId = req.params.id;
    Works.findById(workId)
        .then((work) => {
            if (!work) {
                res.status(404).send('Work not found');
            } else {
                res.render('work_edit', { work: work });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// Route to update the details of a specific work
router.put('/works/:id', (req, res) => {
    const workId = req.params.id;
    const { name, required_no_of_workers, workers_assigned, duration_in_days, priority, completion_status, work_type, date } = req.body;

    Works.findByIdAndUpdate(workId, {
        name: name,
        required_no_of_workers: required_no_of_workers,
        workers_assigned: workers_assigned,
        duration_in_days: duration_in_days,
        priority: priority,
        completion_status: completion_status,
        work_type: work_type,
        date: new Date(date) // Convert date string to Date object
    })
        .then(() => {
            res.redirect('/works');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// Route to render the assignment form for works
router.get('/works/assignment', (req, res) => {
    res.render('works_assignment');
});

// Route to handle assignment form submission and display filtered works
router.post('/works/assignment', async (req, res) => {
    try {
        // Extract the selected work type from the form data
        const workType = req.body.workType;

        // If workType is not provided, send a 400 Bad Request response
        if (!workType) {
            return res.status(400).send('Work type is required');
        }

        // Query the database for works with the specified type and required workers criteria
        const works = await Works.find({
            work_type: workType,
            $expr: {
                $and: [
                    { $lt: ['$workers_assigned', '$required_no_of_workers'] },
                    { $gt: ['$required_no_of_workers', '$workers_assigned'] }
                ]
            }
        }).sort({ priority: 1 });

        // Render the .ejs file with the filtered works
        res.render('works_display_filtered', { works: works });
    } catch (error) {
        // If an error occurs, send a 500 Internal Server Error response
        console.error('Error fetching works:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to allocate a worker to a specific work
router.post('/allocateWorker/:workId/:workType', async (req, res) => {
    try {
        // Extract work ID and work type from request parameters
        const { workId, workType } = req.params;

        // Find workers of the same work_type with active status as false
        const workers = await Workers.find({ role: workType, active: false });

        // If no available workers, send appropriate message
        if (workers.length === 0) {
            return res.status(404).json({ success: false, message: 'No available workers for the specified work type' });
        }

        // Filter out workers who are already assigned to other work
        const availableWorkers = workers.filter(worker => !worker.assigned_to);

        // If no workers available for assignment, send appropriate message
        if (availableWorkers.length === 0) {
            return res.status(400).json({ success: false, message: 'All available workers are already assigned to other work' });
        }

        // Sort available workers based on skill level (expert > intermediate > beginner)
        availableWorkers.sort((a, b) => {
            const skillOrder = { expert: 3, intermediate: 2, beginner: 1 };
            return skillOrder[b.skill_level] - skillOrder[a.skill_level];
        });

        // Find the work by ID
        const work = await Works.findById(workId);

        // Calculate the number of workers needed to meet the required number
        const remainingWorkersNeeded = work.required_no_of_workers - work.workers_assigned;

        // Allocate workers
        let allocatedWorkers = [];
        if (availableWorkers.length >= remainingWorkersNeeded) {
            allocatedWorkers = availableWorkers.slice(0, remainingWorkersNeeded);
        } else {
            allocatedWorkers = availableWorkers;
        }

        // Update work with allocated worker IDs and increment workers_assigned count
        const updatedWork = await Works.findByIdAndUpdate(workId, {
            $addToSet: { assigned_worker_ids: allocatedWorkers.map(worker => worker._id) },
            $inc: { workers_assigned: allocatedWorkers.length }
        }, { new: true });

        // Set the active status of allocated workers to true and mark them as assigned to current work
        await Workers.updateMany({ _id: { $in: allocatedWorkers.map(worker => worker._id) } }, { active: true, assigned_to: workId });

        // If workers are successfully allocated
        return res.status(200).json({ success: true, message: 'Allocation Successful', updatedWork });

    } catch (error) {
        // If an error occurs during the allocation process
        console.error('Error allocating worker:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



// Route to delete a specific work
router.delete('/works/:id', async (req, res) => {
    const workId = req.params.id;

    try {
        // Find the work by ID
        // work = await Works.findById(workId);
        const work = await Works.findById(workId);

        // If work not found, return error
        if (!work) {
            return res.status(404).json({ message: 'Work not found' });
        }

        // Loop through each assigned worker and free them
        for (const workerId of work.assigned_worker_ids) {
            // Find the worker by ID
            const worker = await Workers.findById(workerId);

            // If worker not found, log error and continue
            if (!worker) {
                console.error('Worker not found:', workerId);
                continue;
            }

            // Update the active status of worker to false
            worker.active = false;
            await worker.save();
        }

        // Update the assigned worker count of the associated work
        work.workers_assigned -= work.assigned_worker_ids.length;

        // Delete the work from the collection
        await Works.findByIdAndDelete(workId);

        // Redirect to '/works' after successful deletion
        res.redirect('/works');
    } catch (error) {
        // If an error occurs during the deletion process
        console.error('Error deleting work:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to search for works by name
router.get('/works/search', async (req, res) => {
    const workName = req.query.workName;

    try {
        // Search for works with the provided name
        const works = await Works.find({ name: { $regex: new RegExp(workName, 'i') } });

        if (works.length === 0) {
            // If no works found, render the page with a message
            res.render('work_display', { works: [], message: 'No work found with the provided name' });
        } else {
            // If works found, render the page with the works
            res.render('work_display', { works });
        }
    } catch (err) {
        // If an error occurs during the search process
        console.error('Error searching for works:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display filtered workers based on role and work ID
router.get('/workers_display_filtered', async (req, res) => {
    try {
        const { role, workId } = req.query;
        
        // Find workers with the specified role and inactive status
        const workers = await Workers.find({ role: role, active: false });

        // Sort workers based on skill level (expert > intermediate > beginner)
        workers.sort((a, b) => {
            const skillOrder = { expert: 3, intermediate: 2, beginner: 1 };
            return skillOrder[b.skill_level] - skillOrder[a.skill_level];
        });

        // Render the template with sorted workers data
        res.render('workers_display_filtered', { workers, workId });
    } catch (error) {
        console.error('Error fetching filtered workers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to allocate a specific worker to a specific work
router.put('/allocateWorker/:workerId/:workId', async (req, res) => {
    try {
        // Extract worker ID and work ID from request parameters
        const { workerId, workId } = req.params;

        // Find the worker and work by their IDs
        const worker = await Workers.findById(workerId);
        const work = await Works.findById(workId);

        // If worker or work not found, return error
        if (!worker || !work) {
            return res.status(404).json({ success: false, message: 'Worker or Work not found' });
        }

        // If worker is already active or work has reached required workers limit, return error
        if (worker.active || work.workers_assigned >= work.required_no_of_workers) {
            return res.status(400).json({ success: false, message: 'Worker cannot be allocated to this work' });
        }

        // Update work with allocated worker ID and increment workers_assigned count
        work.assigned_worker_ids.push(workerId);
        work.workers_assigned = work.assigned_worker_ids.length;
        await work.save();

        // Update worker's active attribute to true
        worker.active = true;
        await worker.save();

        return res.status(200).json({ success: true, message: 'Worker allocated successfully' });
    } catch (error) {
        // If an error occurs during the allocation process
        console.error('Error allocating worker:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Route to get workers assigned to a specific work
router.get('/works/:workId/workers', async (req, res) => {
    const workId = req.params.workId;

    try {
        // Find the work by its ID
        const work = await Works.findById(workId);

        if (!work) {
            // If work not found, return error
            return res.status(404).send('Work not found');
        }

        // Retrieve the array of assigned worker IDs
        const assignedWorkerIds = work.assigned_worker_ids;

        // Query the database to find the worker documents based on the assigned IDs
        const workers = await Workers.find({ _id: { $in: assignedWorkerIds } });

        // Render a view with the list of workers
        res.render('workers_assigned_to_work', { workers });
    } catch (err) {
        // If an error occurs during the retrieval process
        console.error('Error retrieving workers assigned to work:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Exporting the router to be used by the main application
module.exports = router;

