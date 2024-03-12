const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const db = require('../database/');
const { error } = require('console');
const { request } = require('http');


router.get('/users/all', (req, res) => {
    db.query(`SELECT * FROM users`, (error, results) => {
        if(error) {
            console.log('Error! ', error);
        }
        else {
            
            res.json(results);
        }
    });
});

router.post('/user/register', (req, res) => {
    const {first_name, last_name, email,  user_type, password} = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if(error) {
            console.log('Error... ', error);
        }
        if(results.length > 0) {
            return res.json({ statusCode: 503, statusMessage: 'User already exists'});
        }
        else {
            let hashedPass = await bcrypt.hash(password, 8);

            db.query('INSERT INTO users SET ?', {first_name: first_name, last_name: last_name, email: email, user_type: user_type, password: hashedPass}, (error, results) => {
                if(error) {
                    console.log('Error... ', error);
                }
                else {
                    return res.json({ statusCode: 200, statusMessage: 'Successfully registerd user'});
                }
            });
        }
    });
});

router.post('/user/login', (req, res) => {
    const {email, user_type, password} = req.body;

    db.query('SELECT * FROM users WHERE email = ? AND user_type = ?', [email, user_type], (error, results) => {
        if(error) {
            console.log('Error...', error);
        }
        else if(results.length > 0) {
            bcrypt.compare(password, results[0].password, (error, response) => {
                if(error){
                    return res.json({ statusCode: 500, statusMessage: "Error comparing"});
                }
                if(response){
                    return res.json({ statusCode: 200, statusMessage: "User logged in successfully"});
                }
                else{
                    return res.json({ statusCode: 505, statusMessage: "Password do not match"});
                }
            });
        }
        else{
            return res.json({ statusCode: 505, statusMessage: "Email does not exist"});
        }

    });
});

 //get file details
 const parentDirectory = path.resolve(__dirname, '..');
 const uploadsDirectory = path.join(parentDirectory, 'uploads');
 process.chdir(uploadsDirectory);

//Route to get file details
router.get('/files', (req, res) => {
 fs.readdir(uploadsDirectory, (err, files) => {
   if (err) {
     console.error('Error reading directory:', err);
     return res.status(500).json({ error: 'Error reading directory' });
   }

   const fileDetails = files.map(fileName => {
     const filePath = path.join(uploadsDirectory, fileName);
     const stats = fs.statSync(filePath);

     return {
       fileName: fileName,
       fileSize: Math.fround(stats.size   / (1024*1024), 2),
       uploadTime: stats.mtime.toLocaleString(), // Get the last modification time as the upload time
       filePath: filePath // Include the full path to the file (optional)
     };
   });

   res.json(fileDetails);
 });
});


//File upload

var storage = multer.diskStorage({

    destination: function(request, file, callBack) {
        callBack(null, uploadsDirectory)
    },

    filename: function(request, file, callBack) {
        console.log('File details below....');
        console.log(file);
        callBack(null, file.originalname);
    }
})

const upload = multer({storage: storage});

router.post('/file/upload', upload.single('file'), (request, response) => {

    if(!request.file) {
        return response.status(400).json({message: 'No file uploaded.'});
    }

      // Access the uploaded file using req.file
     const uploadedFile = request.file;

    // Get the current date and time
    const currentDate = new Date().toLocaleString();;

    // File was uploaded successfully
    response.status(200).json({
        message: 'File uploaded successfully',
        fileName: uploadedFile.originalname,
        fileSize: uploadedFile.size,
        uploadTime: currentDate,
  });


})

//file Download


// Route to handle file downloads
router.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    // Replace 'path-to-uploaded-files' with the actual path where your uploaded files are stored
    const filePath = path.join(parentDirectory, 'uploads', fileName);
  
    // Check if the file exists
    if (!fileExists(filePath)) {
      res.status(404).send('File not found');
      return;
    }
  
    // Set the 'Content-Disposition' header to specify the file name when downloaded
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  
    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
  
  // Helper function to check if the file exists
  function fileExists(filePath) {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }




module.exports = router;