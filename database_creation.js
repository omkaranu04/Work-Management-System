const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const User = require('./models/user');
const Works = require('./models/works');
const Workers = require('./models/workers');

const url = 'mongodb+srv://new_user_local_pc:okayhonachahiye@cluster0.mmcw1jd.mongodb.net/WMS?retryWrites=true&w=majority&appName=Cluster0';

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

const usersData = [
  { login_id: 'user1', password: 'password1' },
  { login_id: 'user2', password: 'password2' },
  { login_id: 'user3', password: 'password3' },
  { login_id: 'user4', password: 'password4' }
];

async function testSignupRoute(usersData) {
  try {
    for (const userData of usersData) {
      const existingUser = await User.findOne({ login_id: userData.login_id });
      if (existingUser) {
        logToDatabaseCreationFile(`USER ALREADY EXITS. REGISTRATION SKIPPED FOR : ${userData.login_id}`);
        continue;
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await User.create({ login_id: userData.login_id, password: hashedPassword });
      logToDatabaseCreationFile(`USER REGISTRATION SUCCESSFUL FOR : ${newUser.login_id}`);
    }
  } catch (error) {
    console.error('ERROR REGISTERING USERS : ', error);
  }
}

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

const worksData = [
  { "name": "Work_A1", "required_no_of_workers": 5, "workers_assigned": 0, "duration_in_days": 5, "priority": 1, "completion_status": false, "work_type": "A", "assigned_worker_ids": [], "date": getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()) },
  { "name": "Work_B1", "required_no_of_workers": 7, "workers_assigned": 0, "duration_in_days": 7, "priority": 2, "completion_status": false, "work_type": "B", "assigned_worker_ids": [], "date": getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()) },
  { "name": "Work_C1", "required_no_of_workers": 9, "workers_assigned": 0, "duration_in_days": 9, "priority": 3, "completion_status": false, "work_type": "C", "assigned_worker_ids": [], "date": getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()) },
  { "name": "Work_D1", "required_no_of_workers": 11, "workers_assigned": 0, "duration_in_days": 11, "priority": 4, "completion_status": false, "work_type": "D", "assigned_worker_ids": [], "date": getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()) },
  { "name": "Work_A2", "required_no_of_workers": 6, "workers_assigned": 0, "duration_in_days": 6, "priority": 1, "completion_status": false, "work_type": "A", "assigned_worker_ids": [], "date": getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()) },
  { "name": "Work_B2", "required_no_of_workers": 8, "workers_assigned": 0, "duration_in_days": 8, "priority": 2, "completion_status": false, "work_type": "B", "assigned_worker_ids": [], "date": getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()) },
  { "name": "Work_C2", "required_no_of_workers": 10, "workers_assigned": 0, "duration_in_days": 10, "priority": 3, "completion_status": false, "work_type": "C", "assigned_worker_ids": [], "date": getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()) },
  { "name": "Work_D2", "required_no_of_workers": 12, "workers_assigned": 0, "duration_in_days": 12, "priority": 4, "completion_status": false, "work_type": "D", "assigned_worker_ids": [], "date": getRandomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date()) }
];

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function addWorksToDatabase() {
  try {
    for (const workData of worksData) {
      const jsonData = JSON.stringify(workData);
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:3000/works',
        headers: {
          'Content-Type': 'application/json'
        },
        data: jsonData
      };
      const response = await axios.request(config);
      logToDatabaseCreationFile(`WORK ADDED SUCCESSFULLY : ${workData.name}`);
    }
  } catch (error) {
    console.error('ERROR ADDING WORKS :', error);
  }
}

/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

const workersData = [
  { "name": "Worker_A1", "age": 25, "gender": "Male", "role": "A", "active": true, "worker_id": 1, "skill_level": "intermediate" },
  { "name": "Worker_A2", "age": 30, "gender": "Female", "role": "A", "active": true, "worker_id": 2, "skill_level": "beginner" },
  { "name": "Worker_A3", "age": 28, "gender": "Male", "role": "A", "active": true, "worker_id": 3, "skill_level": "expert" },
  { "name": "Worker_A4", "age": 35, "gender": "Male", "role": "A", "active": true, "worker_id": 4, "skill_level": "intermediate" },

  { "name": "Worker_B1", "age": 27, "gender": "Female", "role": "B", "active": true, "worker_id": 5, "skill_level": "beginner" },
  { "name": "Worker_B2", "age": 32, "gender": "Male", "role": "B", "active": true, "worker_id": 6, "skill_level": "intermediate" },
  { "name": "Worker_B3", "age": 29, "gender": "Male", "role": "B", "active": true, "worker_id": 7, "skill_level": "expert" },
  { "name": "Worker_B4", "age": 33, "gender": "Female", "role": "B", "active": true, "worker_id": 8, "skill_level": "beginner" },

  { "name": "Worker_C1", "age": 26, "gender": "Female", "role": "C", "active": true, "worker_id": 9, "skill_level": "intermediate" },
  { "name": "Worker_C2", "age": 31, "gender": "Male", "role": "C", "active": true, "worker_id": 10, "skill_level": "expert" },
  { "name": "Worker_C3", "age": 28, "gender": "Female", "role": "C", "active": true, "worker_id": 11, "skill_level": "beginner" },
  { "name": "Worker_C4", "age": 34, "gender": "Male", "role": "C", "active": true, "worker_id": 12, "skill_level": "intermediate" },

  { "name": "Worker_D1", "age": 29, "gender": "Male", "role": "D", "active": true, "worker_id": 13, "skill_level": "expert" },
  { "name": "Worker_D2", "age": 34, "gender": "Female", "role": "D", "active": true, "worker_id": 14, "skill_level": "beginner" },
  { "name": "Worker_D3", "age": 30, "gender": "Male", "role": "D", "active": true, "worker_id": 15, "skill_level": "intermediate" },
  { "name": "Worker_D4", "age": 35, "gender": "Female", "role": "D", "active": true, "worker_id": 16, "skill_level": "expert" }
];

async function addWorkersToDatabase() {
  try {
    for (const workerData of workersData) {
      const jsonData = JSON.stringify(workerData);
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:3000/workers',
        headers: {
          'Content-Type': 'application/json'
        },
        data: jsonData
      };
      const response = await axios.request(config);
      logToDatabaseCreationFile(`WORKER ADDED SUCCESSFULLY : ${workerData.name}`);
    }
  } catch (error) {
    console.error('ERROR ADDING WORKERS : ', error);
  }
}

/*---------------------------------------------------------------------------------------------------------------------------*/

const logFileStream = fs.createWriteStream('database_creation.txt', { flags: 'w' });

function logToDatabaseCreationFile(message) {
  logFileStream.write(`${message}\n`);
}

console.log = function(message) {
  process.stdout.write(message + '\n');
  logToDatabaseCreationFile(message);
};

console.error = function(message) {
  process.stderr.write(message + '\n');
  logToDatabaseCreationFile('[ERROR] ' + message);
};

(async () => {
  try {
    await mongoose.connect(url);
    logToDatabaseCreationFile('Successfully Connected to MongoDB Database');
    await testSignupRoute(usersData);
    await addWorksToDatabase(worksData);
    await addWorkersToDatabase(workersData);
    logToDatabaseCreationFile('All operations completed successfully. Program terminated.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('ERROR : ', error);
  }
})();
