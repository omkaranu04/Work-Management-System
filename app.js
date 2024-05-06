// Importing required modules
const express = require('express'); // Importing Express.js framework
const morgan = require('morgan'); // For logging HTTP requests
const mongoose = require('mongoose'); // For MongoDB database connection
const { render } = require('ejs'); // For rendering EJS templates
const worksRoutes = require('./routes/worksRoutes'); // Routes for works
const workersRoutes = require('./routes/workersRoutes'); // Routes for workers
const methodOverride = require('method-override'); // For HTTP method overriding
const bcrypt = require('bcrypt'); // For password hashing
const User = require('./models/user'); // User model for database interaction

// CONNECTING TO MONGODB DATABASE NAMED 'WMS'
// Creating an instance of the Express application
const app = express();

// Serving static files from the 'public' directory
app.use(express.static('public'));

// Middleware for parsing URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Middleware for HTTP method overriding
app.use(methodOverride('_method'));

// MongoDB connection URL
let url = '' // insert your MongoDB Database URL Here

// Connecting to MongoDB database
mongoose.connect(url)
    .then((result) => console.log('Successfully Connected to MongoDB Database'))
    .catch((err) => console.log(err));

// Starting the server on port 3000
app.listen(3000);

// Setting the view engine to EJS
app.set('view engine', 'ejs');

// Morgan middleware for logging HTTP requests in development mode
app.use(morgan('dev'));

// Route to render the login page
app.get("/", (req, res) => {
    res.render("login");
});

// Route to render the signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Route to render the home page
app.get('/home', (req, res) => {
    res.render('home');
});

// Route to handle user registration
app.post('/signup', async (req, res) => {
    const { login_id, password } = req.body;

    try {
        // Check if the username already exists in the database
        const existingUser = await User.findOne({ login_id: login_id });
        if (existingUser) {
            return res.send('User already exists. Please choose a different username.');
        }

        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user document and save it to the database
        const newUser = await User.create({ login_id: login_id, password: hashedPassword });
        console.log('User registered successfully:', newUser);
        res.redirect('/'); // Redirect to login page after successful signup
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle user login
app.post('/login', async (req, res) => {
    try {
        const check = await User.findOne({ login_id: req.body.login_id });
        if (!check) {
            return res.send("User name cannot found")
        }
        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            return res.send("wrong Password");
        }
        res.redirect('/home');
    }
    catch {
        res.send("wrong Details");
    }
});

// Routing for works-related endpoints
app.use(worksRoutes);

// Routing for workers-related endpoints
app.use(workersRoutes);