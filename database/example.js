const mysql = require('mysql');

let db = mysql.createConnection({
    //Replace the host+name with the appropriate names for your database and DBMS
    host: "hostname",
    user: "hostuser",
    password: "hostpassword",
    database: "hostdatabasename"
});

db.connect((error) => {
    if(error) {
        console.log('Error...', error);
    } else {
        console.log('Successfully connected to database');
        console.log('');
    }
})


module.exports = db;