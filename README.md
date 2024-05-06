# Work Management System

The Work Management System (WMS) is designed to streamline task allocation and management processes
within an organization.
The Work Management System (WMS) aims to facilitate the efficient allocation and management of tasks to
workers within an organization. It encompasses functionalities for user registration, worker management, work assignment, and progress tracking

## Authors

- [@ayushmundada572004](https://github.com/ayushmundada572004)
- [@Tanishka2712](https://github.com/Tanishka2712)
- [@omkaranu04](https://github.com/omkaranu04)


## To Connect to MongoDB Database
To start with setting up your MongoDB Database, follow the following playlist :

```https://youtube.com/playlist?list=PL4cUxeGkcC9h77dJ-QJlwGlZlTd4ecZOA&si=R3h8jHMaqNyfd8Xo```

After setting up your Database URL paste the link on line number 26 of the 'app.js' file, within the parentheses


## Deployment

To deploy this project run make sure you have latest version of Node.js installed

Copy the repository on the local device. Open the folder on a IDE of your choice 

Run the following on your terminal

```bash
npm init
```
and then
```bash
npm install .
```
if you find any vulnerabilites after the above command, run
```bash
npm audit fix
```
to host the software locally, run
```bash
nodemon app
```
the software should run on the localhost:3000 port on your browser
```bash
localhost:3000
```
for any package funding issues on npm, disable the funding locally or globally by running the following commands respectively
```bash
npm config set fund false
or
npm config set fund false --location=global
```

## Sample Database Creation
To create a simple database, run the following command on another terminal with localhost running
```bash
node database_creation.js
```
A new 'database_creation.txt' file will be created after the command is run successfully

## Documentation

The following documents are present in the repository itself : 
* Software Requirement Specification (SRS)
* Test Suite
* Test Plan
* Presentation
