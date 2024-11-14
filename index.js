const express = require("express");
const { redirect } = require("express/lib/response");
const app = express();
const http = require("http").createServer(app);
const multer  = require('multer');
const nodemailer = require('nodemailer');
const path = require("path");
const { Readable } = require('stream');
const port = process.env.PORT || 3000;
const fs = require('fs')
const session = require("express-session");
const bodyParser = require("body-parser");
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');  // Import ObjectId correctly
require('dotenv').config();

// set templating engine
app.set('view engine', 'ejs');
//where the templates are stored
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define the destination directory for storing images
        cb(null, path.join(__dirname, 'public', 'images'));
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for each uploaded image
        cb(null, 'ca_' + Date.now());
    }
});

// DATABASE

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client.db('backend'); // Replace with your database name
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
}));

const upload = multer({ storage: storage });

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));


    // Route handler that loads data from MongoDB
    app.get('/', async (req, res) => {
        const db = await connectToDatabase();
        const collection = db.collection('collieradvies'); // Replace with your actual collection name
        try {
            // Fetch data from MongoDB (you can adjust this to match your collection structure)
            const documents = await collection.find({}).toArray();
            // Render the 'index' view and pass the documents as a variable
            res.render('index', { activePage: 'home', documents: documents });
        } catch (err) {
            console.error("Error fetching documents:", err);
            res.status(500).send('Database error');
        }
    });

    app.get('/home', (req, res) => {
        res.render('index', { activePage: 'home' });
    });

    app.get('/over-ons', (req, res) => {
        res.render('over-ons', { activePage: 'over-ons' });
    });

    app.get('/over-ons/werkwijze', (req, res) => {
        res.render('over-onze-werkwijze', { activePage: ['over-ons', 'werkwijze'] });
    });

    app.get('/over-ons/team', async (req, res) => {
        const db = await connectToDatabase();
        const collection = db.collection('medewerkers'); // Replace with your actual collection name
        try {
            // Fetch data from MongoDB (you can adjust this to match your collection structure)
            const documents = await collection.find({}).toArray();
            // Render the 'index' view and pass the documents as a variable
        res.render('over-ons-team', { activePage: ['over-ons', 'team'], medewerkers: documents });
        } catch (err) {
            console.error("Error fetching documents:", err);
            res.status(500).send('Database error');
        }
    });

    app.get('/over-ons/missie-en-visie', (req, res) => {
        res.render('over-onze-missie-en-visie', { activePage: ['over-ons', 'missie-en-visie'] });
    });

    app.get('/over-ons/samenwerking', (req, res) => {
        res.render('over-onze-samenwerking', { activePage: ['over-ons', 'samenwerking'] });
    });





    app.get('/hr-advies-diensten', (req, res) => {
        res.render('hr-advies-diensten', { activePage: 'hr-advies-diensten' });
    });
    
    app.get('/hr-advies-diensten/hr-support', (req, res) => {
        res.render('hr-advies-diensten-hr-support', { activePage: ['hr-advies-diensten' , 'hr-support'] });
    });

    app.get('/hr-advies-diensten/organisatieontwikkeling', (req, res) => {
        res.render('hr-advies-diensten-organisatie', { activePage: ['hr-advies-diensten' , 'organisatieontwikkeling'] });
    });

    app.get('/hr-advies-diensten/strategisch-hr-advies', (req, res) => {
        res.render('hr-advies-diensten-strategisch', { activePage: ['hr-advies-diensten' , 'strategisch-hr-advies'] });
    });

    app.get('/hr-advies-diensten/bijkomende-dienstverlening', (req, res) => {
        res.render('hr-advies-diensten-bijkomende-dienstverlening', { activePage: ['hr-advies-diensten' , 'bijkomende-dienstverlening'] });
    });



    app.get('/uw-voordeel', (req, res) => {
        res.render('uw-voordeel', { activePage: 'uw-voordeel' });
    });

    app.get('/uw-voordeel/kosten-besparend', (req, res) => {
        res.render('uw-voordeel-kosten-besparend', { activePage: ['uw-voordeel', 'kosten-besparend'] });
    });

    app.get('/uw-voordeel/kwaliteit', (req, res) => {
        res.render('uw-voordeel-kwaliteit', { activePage: ['uw-voordeel', 'kwaliteit'] });
    });

    app.get('/uw-voordeel/continuiteit', (req, res) => {
        res.render('uw-voordeel-continuiteit', { activePage: ['uw-voordeel', 'continuiteit'] });
    });

    app.get('/uw-voordeel/flexibiliteit', (req, res) => {
        res.render('uw-voordeel-flexibiliteit', { activePage: ['uw-voordeel', 'flexibiliteit'] });
    });

    app.get('/contact', (req, res) => {
        res.render('contact', { activePage: 'contact', emailSent: false });
    });

    app.get('/contact/error', (req, res) => {
        res.render('contact', { activePage: 'contact', emailSent: false });
    });

    app.get('/contact/sent', (req, res) => {
        res.render('contact', { activePage: 'contact', emailSent: true });
    });

    app.get('/cursus', (req, res) => {
        res.render('cursus', { activePage: 'cursus', emailSent: false });
    });

    app.get('/cursus/error', (req, res) => {
        res.render('cursus', { activePage: 'cursus', emailSent: false });
    });

    app.get('/cursus/sent', (req, res) => {
        res.render('cursus', { activePage: 'cursus', emailSent: true });
    });

    app.get('/en/cursus', (req, res) => {
        res.render('en-cursus', { activePage: 'cursus', emailSent: false });
    });



    

    app.get('/en/home', (req, res) => {
        res.render('en-index', { activePage: 'home'})
    })

    app.get('/en/over-ons', (req, res) => {
        res.render('en-over-ons', { activePage: 'over-ons' });
    });

    app.get('/en/over-ons/werkwijze', (req, res) => {
        res.render('en-over-onze-werkwijze', { activePage: ['over-ons', 'werkwijze'] });
    });

    app.get('/en/over-ons/team', async (req, res) => {
        const db = await connectToDatabase();
        const collection = db.collection('medewerkers'); // Replace with your actual collection name
        try {
            // Fetch data from MongoDB (you can adjust this to match your collection structure)
            const documents = await collection.find({}).toArray();
            // Render the 'index' view and pass the documents as a variable
        res.render('en-over-ons-team', { activePage: ['over-ons', 'team'], medewerkers: documents });
        } catch (err) {
            console.error("Error fetching documents:", err);
            res.status(500).send('Database error');
        }
    });

    app.get('/en/over-ons/missie-en-visie', (req, res) => {
        res.render('en-over-onze-missie-en-visie', { activePage: ['over-ons', 'missie-en-visie'] });
    });

    app.get('/en/over-ons/samenwerking', (req, res) => {
        res.render('en-over-onze-samenwerking', { activePage: ['over-ons', 'samenwerking'] });
    });





    app.get('/en/hr-advies-diensten', (req, res) => {
        res.render('en-hr-advies-diensten', { activePage: 'hr-advies-diensten' });
    });
    
    app.get('/en/hr-advies-diensten/hr-support', (req, res) => {
        res.render('en-hr-advies-diensten-hr-support', { activePage: ['hr-advies-diensten' , 'hr-support'] });
    });

    app.get('/en/hr-advies-diensten/organisatieontwikkeling', (req, res) => {
        res.render('en-hr-advies-diensten-organisatie', { activePage: ['hr-advies-diensten' , 'organisatieontwikkeling'] });
    });

    app.get('/en/hr-advies-diensten/strategisch-hr-advies', (req, res) => {
        res.render('en-hr-advies-diensten-strategisch', { activePage: ['hr-advies-diensten' , 'strategisch-hr-advies'] });
    });

    app.get('/en/hr-advies-diensten/bijkomende-dienstverlening', (req, res) => {
        res.render('en-hr-advies-diensten-bijkomende-dienstverlening', { activePage: ['hr-advies-diensten' , 'bijkomende-dienstverlening'] });
    });



    app.get('/en/uw-voordeel', (req, res) => {
        res.render('en-uw-voordeel', { activePage: 'uw-voordeel' });
    });

    app.get('/en/uw-voordeel/kosten-besparend', (req, res) => {
        res.render('en-uw-voordeel-kosten-besparend', { activePage: ['uw-voordeel', 'kosten-besparend'] });
    });

    app.get('/en/uw-voordeel/kwaliteit', (req, res) => {
        res.render('en-uw-voordeel-kwaliteit', { activePage: ['uw-voordeel', 'kwaliteit'] });
    });

    app.get('/en/uw-voordeel/continuiteit', (req, res) => {
        res.render('en-uw-voordeel-continuiteit', { activePage: ['uw-voordeel', 'continuiteit'] });
    });

    app.get('/en/uw-voordeel/flexibiliteit', (req, res) => {
        res.render('en-uw-voordeel-flexibiliteit', { activePage: ['uw-voordeel', 'flexibiliteit'] });
    });

    app.get('/en/contact', (req, res) => {
        res.render('en-contact', { activePage: 'contact', emailSent: false });
    });

    app.get('/en/vacatures', async (req, res) => {
        const db = await connectToDatabase();
        const collection = db.collection('vacatures'); // Replace with your actual collection name
        try {
            // Fetch data from MongoDB (you can adjust this to match your collection structure)
            const documents = await collection.find({}).toArray();
            // Render the 'index' view and pass the documents as a variable
            res.render('en-vacatures', { activePage: 'vacatures', vacatures: documents });
        } catch (err) {
            console.error("Error fetching documents:", err);
            res.status(500).send('Database error');
        }
    });

    app.get('/en/vacatures/:href', async (req, res) => {
        const db = await connectToDatabase();
        const collection = db.collection('vacatures'); // Replace with your actual collection name
        try {
            // Fetch data from MongoDB (you can adjust this to match your collection structure)
            const documents = await collection.find({}).toArray();
            // Render the 'index' view and pass the documents as a variable
            // Your additional logic here
            let getHref = documents.find((x) => x.href === req.params.href);
            res.render('en-vacatureDetail', { activePage: 'vacatures', getHref });
        } catch (err) {
            console.error("Error fetching documents:", err);
            res.status(500).send('Database error');
        }
    });


    app.get('/vacatures', async (req, res) => {
        const db = await connectToDatabase();
        const collection = db.collection('vacatures'); // Replace with your actual collection name
        try {
            // Fetch data from MongoDB (you can adjust this to match your collection structure)
            const documents = await collection.find({}).toArray();
            // Render the 'index' view and pass the documents as a variable
            res.render('vacatures', { activePage: 'vacatures', vacatures: documents });
        } catch (err) {
            console.error("Error fetching documents:", err);
            res.status(500).send('Database error');
        }
    });

    app.get('/vacatures/:href', async (req, res) => {
        const db = await connectToDatabase();
        const collection = db.collection('vacatures'); // Replace with your actual collection name
        try {
            // Fetch data from MongoDB (you can adjust this to match your collection structure)
            const documents = await collection.find({}).toArray();
            // Render the 'index' view and pass the documents as a variable
            // Your additional logic here
            let getHref = documents.find((x) => x.href === req.params.href);
            res.render('vacatureDetail', { activePage: 'vacatures', getHref });
        } catch (err) {
            console.error("Error fetching documents:", err);
            res.status(500).send('Database error');
        }
    });

    app.get('/admin-ca', (req, res) => {
        res.render('admin', { activePage: 'admin', blocked: false, found: true })
    })

    app.get('/admin-ca/dashboard', (req, res) => {
        if (req.session.loggedIn) {
            res.render('adminDashboard', { activePage: 'admin' })
        } else {
            res.redirect('/admin-ca')
        }
    })

    app.get('/admin-ca/medewerkers', async (req, res) => {
        if (req.session.loggedIn) {
            const db = await connectToDatabase();
            const collection = db.collection('medewerkers'); // Replace with your actual collection name
            try {
                // Fetch data from MongoDB (you can adjust this to match your collection structure)
                const documents = await collection.find({}).toArray();
                // Render the 'index' view and pass the documents as a variable
                res.render('adminMedewerkers', { activePage: 'admin', medewerkers: documents })
            } catch (err) {
                console.error("Error fetching documents:", err);
                res.status(500).send('Database error');
            }
        } else {
            res.redirect('/admin-ca')
        }
    })

    app.get('/admin-ca/medewerkers/add', (req, res) => {
        if (req.session.loggedIn) {
            res.render('adminMedewerkersAdd', { activePage: 'admin' });
        } else {
            res.redirect('/admin-ca')
        }
    });

    app.get('/admin-ca/medewerkers/edit/:id', async (req, res) => {
        if (req.session.loggedIn) {
            const workerId = req.params.id; // Get the worker ID from the route parameter
            
            try {
                const db = await connectToDatabase();
                const collection = db.collection('medewerkers'); // Replace with your actual collection name
    
                // Convert workerId to ObjectId to use in the MongoDB query
                const objectId = new ObjectId(workerId);
    
                // Find the worker by _id in the database
                const getId = await collection.findOne({ _id: objectId });
    
                if (getId) {
                    // Render the 'adminMedewerkersEdit' view, passing the found worker data
                    res.render('adminMedewerkersEdit', { activePage: 'admin', getId });
                } else {
                    res.status(404).send('Worker not found');
                }
            } catch (err) {
                console.error('Error finding worker:', err);
                res.status(500).send('Database error');
            }
        } else {
            res.redirect('/admin-ca');
        }
    });

    app.post('/add-worker', upload.single('img'), async (req, res) => {
        if (req.session.loggedIn) {
            const db = await connectToDatabase();
            const collection = db.collection('medewerkers'); // Replace with your actual collection name
            try {
                // Check if a file was uploaded
                if (req.file) {
                    // Assuming 'foundWorker' represents the worker whose image is being updated
                    // Update the image path in the worker data
                    req.body.img = req.file.filename; // Adjust path as needed
                } else {
                    console.log('No image uploaded')
                }
            
                // Convert 'online' property to a boolean
                req.body.online = (req.body.online === 'on');

                const result = await collection.insertOne(req.body);
                console.log(result)
            
                res.redirect('/admin-ca/medewerkers');
            } catch (err) {
                console.error("Error fetching documents:", err);
                res.status(500).send('Database error');
            }
        } else {
            res.redirect('/admin-ca')
        }
    });

    app.post('/edit-worker', upload.single('img'), async (req, res) => {
        if (req.session.loggedIn) {
            const updatedWorker = req.body;
            const workerId = req.body.id;
    
            try {
                const db = await connectToDatabase();
                const collection = db.collection('medewerkers'); // Replace with your actual collection name
    
                // Convert workerId to ObjectId for MongoDB query
                const objectId = new ObjectId(workerId);
    
                // Prepare the update object with required fields
                const updateFields = {
                    naam: updatedWorker.naam,
                    textinhoud: updatedWorker.textinhoud,
                    textEn: updatedWorker.textEn
                };
    
                // Check the online checkbox state and set it accordingly
                const isChecked = req.body.online;
                if (isChecked) {
                    updateFields.online = true;
                } else {
                    updateFields.online = false;
                }
    
                // Only add the 'img' field if a file was uploaded
                if (req.file) {
                    updateFields.img = req.file.filename;
                    console.log('Image uploaded successfully:', req.file.filename);
                }
    
                // Update the worker document in the database
                const result = await collection.updateOne(
                    { _id: objectId }, // Filter by the _id field
                    { $set: updateFields } // Update the fields
                );
    
                if (result.modifiedCount === 1) {
                    console.log('Worker updated successfully');
                    res.redirect('/admin-ca/medewerkers'); // Redirect after successful update
                } else {
                    console.log('Worker not found or no changes made');
                    res.status(404).send('Worker not found or no changes made');
                }
            } catch (err) {
                console.error("Error updating worker:", err);
                res.status(500).send('Database error');
            }
        } else {
            res.redirect('/admin-ca');
        }
    });
    

app.get('/delete-worker/:id', async (req, res) => {
    if (req.session.loggedIn) {
        const userId = req.params.id;
        
        try {
            // Connect to the database
            const db = await connectToDatabase();
            const collection = db.collection('medewerkers'); // Replace with your actual collection name

            // Convert the userId from string to MongoDB ObjectId
            const objectId = new ObjectId(userId); // Use 'new' to instantiate ObjectId

            // Delete the worker with the provided _id
            const result = await collection.deleteOne({ _id: objectId });

            if (result.deletedCount === 1) {
                console.log('Worker deleted successfully');
                res.redirect('/admin-ca/medewerkers'); // Redirect after successful deletion
            } else {
                console.log('No worker found with the provided id');
                res.status(404).send('Worker not found');
            }
        } catch (err) {
            console.error("Error deleting worker:", err);
            res.status(500).send('Database error');
        }
    } else {
        res.redirect('/admin-ca');
    }
});

    app.get('/admin-ca/vacatures', async (req, res) => {
        if (req.session.loggedIn) {
            const db = await connectToDatabase();
            const collection = db.collection('vacatures'); // Replace with your actual collection name
            try {
                // Fetch data from MongoDB (you can adjust this to match your collection structure)
                const documents = await collection.find({}).toArray();
                // Render the 'index' view and pass the documents as a variable
            res.render('adminVacatures', { activePage: 'admin', vacatures: documents})
            } catch (err) {
                console.error("Error fetching documents:", err);
                res.status(500).send('Database error');
            }
        } else {
            res.redirect('/admin-ca')
        }
    })

    app.get('/admin-ca/vacatures/add', (req, res) => {
        if (req.session.loggedIn) {
            res.render('adminVacaturesAdd', { activePage: 'admin', });
        } else {
            res.redirect('/admin-ca')
        }
    });

    app.post('/add-vacature', upload.single('img'), async (req, res) => {
        if (req.session.loggedIn) {const db = await connectToDatabase();
            const collection = db.collection('vacatures'); // Replace with your actual collection name
            try {
                // Check if a file was uploaded
                if (req.file) {
                    // Assuming 'foundWorker' represents the worker whose image is being updated
                    // Update the image path in the worker data
                    req.body.img = req.file.filename; // Adjust path as needed
                } else {
                    console.log('No image uploaded')
                }
            
                // Convert 'online' property to a boolean
                req.body.online = (req.body.online === 'on');

                const result = await collection.insertOne(req.body);
                console.log(result)
            
                res.redirect('/admin-ca/vacatures');
            } catch (err) {
                console.error("Error fetching documents:", err);
                res.status(500).send('Database error');
            }
        } else {
            res.redirect('/admin-ca')
        }
    });

    app.get('/delete-vacature/:id', async (req, res) => {
        if (req.session.loggedIn) {
            const userId = req.params.id;
            
            try {
                // Connect to the database
                const db = await connectToDatabase();
                const collection = db.collection('vacatures'); // Replace with your actual collection name
    
                // Convert the userId from string to MongoDB ObjectId
                const objectId = new ObjectId(userId); // Use 'new' to instantiate ObjectId
    
                // Delete the worker with the provided _id
                const result = await collection.deleteOne({ _id: objectId });
    
                if (result.deletedCount === 1) {
                    console.log('Worker deleted successfully');
                    res.redirect('/admin-ca/vacatures'); // Redirect after successful deletion
                } else {
                    console.log('No worker found with the provided id');
                    res.status(404).send('Worker not found');
                }
            } catch (err) {
                console.error("Error deleting worker:", err);
                res.status(500).send('Database error');
            }        
        } else {
            res.redirect('/admin-ca')
        }
    });

    app.get('/admin-ca/vacatures/edit/:id', async (req, res) => {
        if (req.session.loggedIn) {
            try {
                const id = req.params.id; // Get the ID from the request parameter
                const db = await connectToDatabase(); // Connect to your MongoDB
                const collection = db.collection('vacatures'); // Access the 'vacatures' collection
    
                // Convert ID to an ObjectId for querying in MongoDB
                const objectId = new ObjectId(id);
    
                // Find the document with the specified _id in MongoDB
                const getId = await collection.findOne({ _id: objectId });
    
                // If no document is found, handle it
                if (!getId) {
                    return res.status(404).send("Vacature not found");
                }
    
                // Render the edit page with the found document
                res.render('adminVacaturesEdit', { activePage: 'admin', getId });
            } catch (error) {
                console.error("Error retrieving vacature:", error);
                res.status(500).send("Database error");
            }
        } else {
            res.redirect('/admin-ca');
        }
    });
    

    app.post('/edit-vacature', upload.single('img'), async (req, res) => {
        if (req.session.loggedIn) {
            const updatedVacature = req.body;
            const vacatureId = req.body.id;
    
            try {
                const db = await connectToDatabase();
                const collection = db.collection('vacatures'); // Access the 'vacatures' collection
    
                // Convert ID to an ObjectId for MongoDB querying
                const objectId = new ObjectId(vacatureId);
    
                // Prepare the update object with fields from the form
                const updateFields = {
                    positie: updatedVacature.positie,
                    positieEn: updatedVacature.positieEn,
                    bedrijf: updatedVacature.bedrijf,
                    dienstverband: updatedVacature.dienstverband,
                    uren: updatedVacature.uren,
                    locatie: updatedVacature.locatie,
                    textinhoud: updatedVacature.textinhoud,
                    textEn: updatedVacature.textEn,
                    href: `${updatedVacature.positie.toLowerCase()}-${updatedVacature.locatie.toLowerCase()}`,
                };
    
                // Determine the value of 'online' based on isChecked
                const isChecked = req.body.online;
                if (isChecked) {
                    updateFields.online = true;
                } else {
                    updateFields.online = false;
                }
    
                // If an image file was uploaded, add it to the update fields
                if (req.file) {
                    console.log('Image uploaded successfully:', req.file.filename);
                    updateFields.logo = req.file.filename;
                } else {
                    console.log('No image uploaded.');
                }
    
                // Update the document in MongoDB
                const result = await collection.updateOne(
                    { _id: objectId },
                    { $set: updateFields }
                );
    
                if (result.modifiedCount === 1) {
                    console.log('Vacature updated successfully');
                    res.redirect('/admin-ca/vacatures');
                } else {
                    res.redirect('/admin-ca/vacatures');
                }
            } catch (err) {
                console.error("Error updating vacature:", err);
                res.status(500).send('Database error');
            }
        } else {
            res.redirect('/admin-ca');
        }
    });
    

    // CURSUS

    app.get('/admin-ca/cursus', async (req, res) => {
        if (req.session.loggedIn) {
            const db = await connectToDatabase();
            const collection = db.collection('deelnemers'); // Replace with your actual collection name
            try {
                // Fetch data from MongoDB (you can adjust this to match your collection structure)
                const documents = await collection.find({}).toArray();
                // Render the 'index' view and pass the documents as a variable
            res.render('adminDeelnemers', { activePage: 'admin', deelnemers:documents })
            } catch (err) {
                console.error("Error fetching documents:", err);
                res.status(500).send('Database error');
            }
        } else {
            res.redirect('/admin-ca')
        }
    });

    // function convertToCSV(data) {
    //     const header = Object.keys(data[0]).join(','); // Get the header from keys
    //     const rows = data.map(row => Object.values(row).join(',')); // Get values for each row
    //     return [header, ...rows].join('\n'); // Combine header and rows into CSV format
    // }
    
    // app.get('/admin-ca/cursus/download', (req, res) => {
    //     const csvData = convertToCSV(deelnemers); // Convert deelnemers to CSV format
    
    //     // Write CSV to the server's filesystem
    //     fs.writeFile(path.join(__dirname, 'deelnemers-cursus.csv'), csvData, 'utf8', (err) => {
    //         if (err) {
    //             console.error('Error writing CSV file:', err);
    //             return res.status(500).send('Failed to create CSV file');
    //         }
    
    //         console.log('CSV file successfully created as deelnemers-cursus.csv');
    
    //         // After writing, call download function
    //         downloadFile(res);
    //     });
    // });
    
    // // Function to handle file download
    // function downloadFile(res) {
    //     const filePath = path.join(__dirname, 'deelnemers-cursus.csv');
    
    //     // Send the file as a download
    //     res.download(filePath, 'deelnemers-cursus.csv', (err) => {
    //         if (err) {
    //             console.error('Error sending file:', err);
    //             return res.status(500).send('Failed to download CSV file');
    //         }
    
    //         // Optionally, delete the file after sending
    //         fs.unlink(filePath, (unlinkErr) => {
    //             if (unlinkErr) {
    //                 console.error('Error deleting file:', unlinkErr);
    //             } else {
    //                 console.log('CSV file deleted from server.');
    //             }
    //         });
    //     });
    // };  

    app.get('/admin-ca/cursus/add', (req, res) => {
        if (req.session.loggedIn) {
            res.render('adminDeelnemersAdd', { activePage: 'admin' });
        } else {
            res.redirect('/admin-ca')
        }
    });

    app.post('/add-deelnemer',upload.single('img'), async (req, res) => {
        if (req.session.loggedIn) {
            const db = await connectToDatabase();
            const collection = db.collection('deelnemers'); // Replace with your actual collection name
            try {
            
                // Convert 'online' property to a boolean
                req.body.optionOne = (req.body.optionOne === 'off');
                req.body.optionTwo = (req.body.optionTwo === 'off');
                req.body.optionThree = (req.body.optionThree === 'off');

                const result = await collection.insertOne(req.body);
                console.log(result)
            
                res.redirect('/admin-ca/cursus');
            } catch (err) {
                console.error("Error fetching documents:", err);
                res.status(500).send('Database error');
            }
        } else {
            res.redirect('/admin-ca')
        }
    });
    
    app.get('/admin-ca/cursus/edit/:id', async (req, res) => {
        if (req.session.loggedIn) {
            try {
                const id = req.params.id;  // Get the ID from the request parameter
                
                const db = await connectToDatabase(); // Connect to your MongoDB
                const collection = db.collection('deelnemers'); // Access the 'deelnemers' collection
                
                // Convert ID to an ObjectId for querying in MongoDB
                const objectId = new ObjectId(id);
    
                // Find the document with the specified _id in MongoDB
                const getId = await collection.findOne({ _id: objectId });
                
                if (!getId) {
                    // Handle case where no matching document is found
                    return res.status(404).send("Deelnemer not found");
                }
    
                // Render the edit page with the found document
                res.render('adminDeelnemersEdit', { activePage: 'admin', getId });
    
            } catch (error) {
                console.error("Error retrieving deelnemer:", error);
                res.status(500).send("Database error");
            }
        } else {
            res.redirect('/admin-ca');
        }
    });

    app.post('/edit-deelnemer', upload.single('img'), async (req, res) => {
        if (req.session.loggedIn) {
            console.log(req.body);
            const id = req.body.id; // Using the raw ID for MongoDB
    
            try {
                const db = await connectToDatabase();
                const collection = db.collection('deelnemers');
    
                // Define the updated fields based on request data
                const updatedFields = {
                    naam: req.body.naam,
                    functie: req.body.functie,
                    bedrijfsnaam: req.body.bedrijfsnaam,
                    straatnaam: req.body.straatnaam,
                    huisnummer: req.body.huisnummer,
                    woonplaats: req.body.woonplaats,
                    postcode: req.body.postcode,
                    wensen: req.body.wensen,
                    email: req.body.email,
                    tel: req.body.tel,
                };
    
                // For optionOne, optionTwo, and optionThree, check if they were checked
                const isOptionOneChecked = req.body.optionOne;
                const isOptionTwoChecked = req.body.optionTwo;
                const isOptionThreeChecked = req.body.optionThree;
    
                if (isOptionOneChecked) {
                    updatedFields.optionOne = true;
                } else {
                    updatedFields.optionOne = false;
                }
    
                if (isOptionTwoChecked) {
                    updatedFields.optionTwo = true;
                } else {
                    updatedFields.optionTwo = false;
                }
    
                if (isOptionThreeChecked) {
                    updatedFields.optionThree = true;
                } else {
                    updatedFields.optionThree = false;
                }
    
                // Include the image filename if a new file was uploaded
                if (req.file) {
                    updatedFields.img = req.file.filename;
                }
    
                // Update document in MongoDB
                const result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedFields }
                );
    
                if (result.matchedCount === 0) {
                    console.log(`No deelnemer found with id ${id}`);
                } else {
                    console.log(`Deelnemer with id ${id} updated successfully.`);
                }
    
                res.redirect('/admin-ca/cursus');
            } catch (error) {
                console.error("Error updating deelnemer:", error);
                res.status(500).send("Database error");
            }
        } else {
            res.redirect('/admin-ca');
        }
    });
    

    app.get('/delete-deelnemer/:id', async (req, res) => {
        if (req.session.loggedIn) {
            const userId = req.params.id;
            
            try {
                const db = await connectToDatabase(); // Connect to your MongoDB
                const collection = db.collection('deelnemers'); // Access the 'deelnemers' collection
    
                // Convert ID to ObjectId for querying in MongoDB
                const objectId = new ObjectId(userId);
    
                // Perform the deletion operation
                const result = await collection.deleteOne({ _id: objectId });
    
                // If no document was deleted, return an error
                if (result.deletedCount === 0) {
                    return res.status(404).send("Deelnemer not found");
                }
    
                // Redirect to the list of participants after successful deletion
                res.redirect('/admin-ca/cursus');
    
            } catch (error) {
                console.error("Error deleting deelnemer:", error);
                res.status(500).send("Database error");
            }
        } else {
            res.redirect('/admin-ca');
        }
    });
    
    




    // MAIL

    // Set up transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use another service
    auth: {
      user: `${process.env.NODEMAILER_MAIL}`,       // Your email address
      pass: `${process.env.NODEMAILER_WW}`,        // Your email password or app password
    },
  });

  // Handle form submission
app.post('/send-email', async (req, res) => {
  const { naam, email, tel, functie, postcode, straatnaam, huisnummer, woonplaats, wensen, bedrijfsnaam } = req.body;

  // Email options
  const mailOptions = {
    from: `${process.env.NODEMAILER_MAIL}`,
    to: `${email}`,   // The recipient email address
    subject: `Bevestiging aanmelding`,
    html: `<section style="padding:1em;background-color:#a73f98;width: 600px;margin: 0 auto;">
            <h2 style="text-align:center;color:#fff;">Bevestiging aanmelding</h2>
            <section style="background-color: #fff!important;padding:1em;text-align: left">
            
            <p><hr>Beste ${naam},<br><br>
            Hartelijk bedankt voor uw aanmelding voor de training Verzuim met trainingsacteur! Wij
            kijken ernaar uit u te mogen ontvangen op <b>donderdag 27 februari 2025 tussen 08:30 en 08:45</b> bij de
            Watertoren in Lisse.<br><br>
            De kosten voor het bijwonen van de training bedragen, zoals reeds vermeld, <b>€ 450,- excl.
            btw per persoon</b>. U ontvangt <b>binnen drie werkdagen</b> van ons de factuur om voor de training
            te betalen.<br><br>
            Wij hopen u hiermee voorlopig voldoende te hebben geïnformeerd. Mocht u vragen hebben,
            dan kunt u uiteraard contact met ons opnemen.<br><br>
            Met vriendelijke groet,<br>
            Collier Advies<br><br>
            Laura van der Lans<br>
            laura@collier-advies.nl</p>
            </section></section>`,
  };

  const mailConfirmed = {
    from: `${process.env.NODEMAILER_MAIL}`,
    to: `${process.env.NODEMAILER_MAIL}`,   // The recipient email address
    subject: `Bevestiging nieuwe deelnemer`,
    html: `<section style="padding:1em;background-color:#a73f98;width: 600px;margin: 0 auto;">
            <h2 style="text-align:center;color:#fff;">Nieuwe aanmelding</h2>
            <section style="background-color: #fff!important;padding:1em;text-align: left">
            
            <p>Naam: ${naam}</p>
            <p>Functie: ${functie}</p>
            <p>Bedrijfsnaam: ${bedrijfsnaam}</p>
            <p>Factuuradres: ${straatnaam} ${huisnummer} ${postcode} ${woonplaats}</p>
            <p>Email: ${email}</p>
            <p>Telefoonnummer: ${tel}</p>
            <p>Wensen: ${wensen}</p>
            </section></section>`,
  };

  try {
    // Send the first email
    const info1 = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info1.response);

    // Send the second email (confirmation)
    const info2 = await transporter.sendMail(mailConfirmed);
    console.log('Confirmation email sent: ' + info2.response);

    // Check if the 'wensen' field exists and wrap it in double quotes
    if (req.body.wensen) {
      req.body.wensen = `"${req.body.wensen}"`;
    }

    // No login check required anymore, just insert into the database
    const db = await connectToDatabase();
    const collection = db.collection('deelnemers'); // Replace with your actual collection name

    // Convert 'option' properties to booleans
    req.body.optionOne = (req.body.optionOne === 'off');
    req.body.optionTwo = (req.body.optionTwo === 'off');
    req.body.optionThree = (req.body.optionThree === 'off');

    // Insert the data into the database
    const result = await collection.insertOne(req.body);
    console.log(result);

    // Redirect to the desired page after successful database insert
    return res.redirect('/admin-ca/cursus');

  } catch (error) {
    console.error(error);
    return res.redirect('/cursus/error');
  }
});

/* <img src="https://www.collier-advies.nl/images/collier-advies-logo.png" style="display:flex; margin:.5em auto; width: 150px;margin-bottom:1em">
<img src="https://www.collier-advies.nl/images/collier-advies-logo.png" style="display:flex; margin:.5em auto; width: 150px;margin-bottom:1em">
<img src="https://www.collier-advies.nl/images/collier-advies-logo.png" style="display:flex; margin:.5em auto; width: 150px;margin-bottom:1em">
<img src="https://www.collier-advies.nl/images/collier-advies-logo.png" style="display:flex; margin:.5em auto; width: 150px;margin-bottom:1em"> */


  //   CONTACT FORM

  app.post('/send-form', (req, res) => {
    const { naam, email, tel, msg } = req.body;
  
    // Email options
    const mailOptions = {
        from: `${process.env.NODEMAILER_MAIL}`,
        to: `${email}`,   // The recipient email address
        subject: `Bedankt voor uw bericht`,
        html: `<section style="padding:1em;background-color:#a73f98;width: 600px;margin: 0 auto;"><h2 style="text-align:center;color:#fff;">Contactformulier</h2><section style="background-color: #fff!important;padding:1em;text-align: center"><p>Hallo ${naam}, <br><br> Bedankt voor uw bericht!<br> Wij streven er naar om binnen 24 contact met u op te nemen! </p></section></section>`,
      };

      const mailConfirmed = {
        from: `${process.env.NODEMAILER_MAIL}`,
        to: `${process.env.NODEMAILER_MAIL}`,   // The recipient email address
        subject: `Contactformulier - Collier Advies`,
        html: `<section style="padding:1em;background-color:#a73f98;width: 600px;margin: 0 auto;"><h2 style="text-align:center;color:#fff;">Contactformulier</h2><section style="background-color: #fff!important;padding:1em;text-align: left"><p>Naam: ${naam}</p><p>Email: ${email}</p><p>Telefoonnummer: ${tel}</p><p>Bericht:<br> ${msg}</p></section></section>`,
      };

      // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.redirect('/contact/error');
        } else {
          console.log('Email sent: ' + info.response);
          transporter.sendMail(mailConfirmed, (error, info) => {
              if (error) {
                console.log(error);
                res.redirect('/contact/error');
              } else {
                console.log('Email sent: ' + info.response);
                
                res.redirect('/contact/sent');
              }
            });
          res.redirect('/contact/sent');
        }
      });
    });

    // LOGIN

    // Route for handling login
app.post("/login", async (req, res) => {
    const { gebruikersnaam, wachtwoord } = req.body;

    try {
        // Connect to the database
        const db = await connectToDatabase();
        const accountsCollection = db.collection('accounts');

        // Find account by username in MongoDB
        const account = await accountsCollection.findOne({ gebruikersnaam });

        if (account) {
            if (account.blocked) {
                // If account is blocked, render with blocked status
                res.render('admin', { activePage: 'admin', blocked: true, found: true });
            } else {
                // Compare the input password with the hashed password in the database
                const passwordMatch = await bcrypt.compare(wachtwoord, account.wachtwoord);

                if (passwordMatch) {
                    // If password is correct, reset attempts, log in the user, and redirect
                    await accountsCollection.updateOne(
                        { _id: new ObjectId(account._id) }, // Use new ObjectId here
                        { $set: { pogingen: 0 } }
                    );
                    
                    req.session.loggedIn = true;
                    res.redirect("/admin-ca/dashboard");
                } else {
                    // If password is incorrect, increment `pogingen`
                    const newPogingen = (account.pogingen || 0) + 1;
                    
                    // Update attempts and possibly block the account
                    if (newPogingen >= 3) {
                        await accountsCollection.updateOne(
                            { _id: new ObjectId(account._id) }, // Use new ObjectId here
                            { $set: { blocked: true, pogingen: newPogingen } }
                        );
                        res.render('admin', { activePage: 'admin', blocked: true, found: true });
                    } else {
                        await accountsCollection.updateOne(
                            { _id: new ObjectId(account._id) }, // Use new ObjectId here
                            { $set: { pogingen: newPogingen } }
                        );
                        res.render('admin', { activePage: 'admin', blocked: false, found: false });
                    }
                }
            }
        } else {
            // If account is not found, render with blocked false and found false
            res.render('admin', { activePage: 'admin', blocked: false, found: false });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal server error");
    }
});

    

    // Route for logging out
    app.get("/logout", (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.send("Error logging out");
            }
            res.redirect("/");
        });
    });

    console.log("NODEMAILER_MAIL:", process.env.NODEMAILER_MAIL);
console.log("NODEMAILER_WW:", process.env.NODEMAILER_WW);

  



    // 404
    app.use((req, res, next) => {
        res.status(404).render('404', { activePage: '404'});
    });

    // Error
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something went wrong!');
    });

    http.listen(port, () => {
        console.log("listening on port ", port);
    })