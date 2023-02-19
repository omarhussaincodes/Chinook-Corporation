const express = require("express");
const multer = require("multer");
const methodOverride = require('method-override');
const flash = require('connect-flash');
const bodyParser = require("body-parser");
const Database = require("better-sqlite3");
const ExpressError = require("./utils/ExpressError");
const cors = require("cors");
const db = new Database("./Chinook_Sqlite.sqlite");
const upload = multer();
const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

// middleware for setting response headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    next();
});

app.get('/employees', (req, res) => {
    const employees = db.prepare("SELECT * from EMPLOYEE").all();
    res.send(JSON.stringify(employees));
});

app.get('/customers', (req, res) => {
    const query = `
            SELECT c.FirstName,c.LastName,c.Address,c.city,c.country,c.PostalCode,c.Phone,c.email,e.FirstName,e.LastName
            FROM Customer AS "c"
            JOIN Employee AS "e"
            on c.SupportRepId=e.EmployeeId;
            `;
    const customers = db.prepare(query).expand(true).all();
    res.send(JSON.stringify(customers));
});

app.get('/tracks', (req, res) => {
    const tracks = db.prepare("SELECT * from TRACK WHERE Composer IS NOT NULL ORDER BY Name DESC LIMIT 50").all();
    res.send(JSON.stringify(tracks));
});

app.get('/albums', (req, res) => {
    const query = `
        select title as "AlbumName",name as "Artist" from Album join Artist
        on Album.ArtistId=Artist.ArtistId  ORDER BY title;
    `;
    const albums = db.prepare(query).expand(true).all();
    res.send(JSON.stringify(albums));
});

app.get('/customers/:country', (req, res) => {
    const country = req.params.country;
    const query = `
            SELECT c.FirstName,c.LastName,c.Address,c.city,c.country,c.PostalCode,c.Phone,c.email,e.FirstName,e.LastName
            FROM Customer AS "c"
            JOIN Employee AS "e"
            on c.SupportRepId=e.EmployeeId
            WHERE c.Country = ?
            `;
    const customersByCountry = db.prepare(query).expand(true).bind(country).all();
    res.send(JSON.stringify(customersByCountry));
});

app.put('/tracks/:trackId', upload.none(), (req, res) => {
    const { trackId } = req.params;
    console.log(req.body);
    const { trackName, composer, unitPrice } = req.body;
    const query = `
        UPDATE Track
        SET 
            Name = ?,
            Composer = ?,
            UnitPrice = ?
        WHERE TrackId = ?
    `;
    try {
        dbResponse = db.prepare(query).run(trackName, composer, unitPrice, trackId);
        res.status(200).end();
    } catch (e) {
        console.log(e);
        console.log("Database Errror - Failed to Update into Tracks Table!", e.message)
        res.status(500).end();
    }
});

app.post('/addEmployee', upload.none(), (req, res) => {
    const { firstName, lastName, email, title } = req.body;
    console.log(req.body);
    const query = `
        INSERT INTO EMPLOYEE (FirstName, LastName, Email, Title)
        values (?,?,?,?)
    `;
    let dbResponse;
    try {
        dbResponse = db.prepare(query).run(firstName, lastName, email, title);
        res.status(200).end();
    } catch (e) {
        console.log(e);
        console.log("Database Errror - Failed to Insert into Employee Table!", e.message)
        res.status(500).end();
    }
});

app.delete("/employees/:id", (req, res) => {
    const { id } = req.params;
    const query = `
        DELETE FROM EMPLOYEE 
        WHERE EmployeeId = ?
    `;
    let dbResponse;
    try {
        dbResponse = db.prepare(query).bind(id).run();
        res.status(200).end();
    } catch (e) {
        console.log(e);
        console.log("Database Errror - Failed to Delete Employee!", e.message);
        res.status(500).end();
    }
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

// error handling should be defined last
// app.use((err, req, res, next) => {
//     const { statusCode = 500 } = err;
//     if (!err.message) err.message = 'Oh No, Something Went Wrong!'
//     res.status(statusCode).send('error', { err })
// });

app.listen(PORT, () => {
    console.log(`Listening to ${PORT} -- ALIVE!!`);
});

