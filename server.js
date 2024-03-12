const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const bodyParser = require('body-parser');
const apiRoute = require('./routes/app');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Serve the frontend files from a 'public' directory
app.use(express.static('public'));

app.use((req, res, next) => {
   // res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

app.get('/api/connect', (req, res) => {
    res.json({
        "statusCode": 200,
        "statusMessage": "Success"
    });
});

app.use('/api', apiRoute);

app.listen(3000, (req, res) => {
    console.log('Server running on port: 3000');
});