// Dependencies
// =============================================================
const express = require("express");
const path = require("path");
const fs = require('fs');

// Sets up the Express App
// =============================================================
const app = express();
const PORT = 8080;

const jsonFile = "./db/db.json";
let lastId = 0;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve Static Assets
app.use(express.static('public'));


// HTML Routes
// =============================================================

// // Should return the `notes.html` file.
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
  });

// If no matching route is found default to home
 app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

// API Routes
// =============================================================
//GET api notes
app.get('/api/notes', (req, res) => {
    //read the db.json file
    fs.readFile(jsonFile, (err, db) => {
        if (err) throw err;
        let notes = JSON.parse(db);

        //sett he lastId
        if((Array.isArray(notes) && notes.length)) {
            lastId = parseInt(notes[notes.length -1].id);
        } else {
            lastId=0;
        }
        res.json(notes);

    });
  });

//POST api notes
app.post("/api/notes", function(req, res) {
    // req.body hosts equal to the JSON post sent from the user
    // This works because of our body parsing middleware
    let enteredNote = req.body
    enteredNote.id=lastId+=1;

    //open db.json file, 
    fs.readFile(jsonFile, (err, db) => {
        if (err) throw err;

        //parse the json
        var json = JSON.parse(db)

        //append your new result to the array,
        json.push(enteredNote)
    
        //transform it back into a string and save it again.
        fs.writeFile(jsonFile, JSON.stringify(json), (err) => {
            if (err) throw err;
            console.log('appended note to db.json');
        });
    })
    res.json(enteredNote);

  });

//DELETE api notes
app.delete('/api/notes/:id',  (req, res) => {
    
    //read all the notes
    fs.readFile(jsonFile, (err, db) => {
        if (err) throw err;
        let notes = JSON.parse(db);

        //filter out the deleted one
        let filteredNotes = notes.filter((note) => { 
            return note.id != req.params.id;  
        });
       
        //rewrite the filtered notes to the db.json
        fs.writeFile(jsonFile, JSON.stringify(filteredNotes), (err) => {
            if (err) throw err;
            console.log(`entry: ${req.params.id} has been deleted!`);

        });

        res.json(req.params.id)
    });
    
 });
     


// Starts the server to begin listening
// =============================================================
 app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });