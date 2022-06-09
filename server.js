let sqlite3 = require("sqlite3").verbose();
let express = require("express");
let http = require("http");
let path = require("path");
let bodyParser = require("body-parser");
const req = require("express/lib/request");
let app = express();
let server = http.createServer(app);
// require('dotenv').config()
let port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let db = new sqlite3.Database("tickets.db");

function createTable() {
    db.run(
      "CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, event_name TEXT NOT NULL, event_description TEXT NOT NULL, ticket_price INT NOT NULL,currency TEXT, orange_account INT,lonestar_account INT, location TEXT NOT NULL, event_date date, num_participants INT NOT NULL, img url)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS participants(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT NOT NULL,phone_number INT NOT NULL, price INT NOT NULL, img url)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS admin(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, nickname TEXT,img url UNIQUE)"
    );
  }
  createTable();
  // ____________________________________ POST ROUTE ________________________________________________
// POST TO THE EVENT'S TABLE
app.post("/events", function (req, res) {
  let bodydata = req.body;
  console.log(bodydata);

  let query = `INSERT INTO events(event_name, event_description, ticket_price, currency, orange_account, lonestar_account,location, event_date, num_participants, img) VALUES(?,?,?,?,?,?,?,?,?,?)`;
  db.run(
    query,
    [
      bodydata["event_name"],
      bodydata["event_description"],
      bodydata["ticket_price"],
      bodydata["currency"],
      bodydata["orange_account"],
      bodydata["lonestar_account"],
      bodydata["location"],
      bodydata["event_date"],
      bodydata["num_participants"],
      bodydata["img"],
    ],
    (err) => {
      if (err) {
        console.log(err);
        res.send("Unsuccessful");
      } else {
        res.send("Your Events table was inserted successfully");
      }
    }
  );
});

// POST TO THE PARTICIPANTS TABLE
app.post("/participants", function (req, res) {
    let bodydata = req.body;
    console.log(bodydata);
  
    let query = `INSERT INTO participants(name, address, phone_number, price, img) VALUES(?,?,?,?,?)`;
    db.run(
      query,
      [
        bodydata["name"],
        bodydata["address"],
        bodydata["phone_number"],
        bodydata["price"],
        bodydata["img"],
      ],
      (err) => {
        if (err) {
          console.log(err);
          res.send("Unsuccessful");
        } else {
          // console.log("Your Host table was inserted successfully");
          res.send("Your Participants table was inserted successfully");
        }
      }
    );
  });
  // POST TO THE ADMIN TABLE
  app.post("/admin", function (req, res) {
    let bodydata = req.body;
    console.log(bodydata);
  
    let query = `INSERT INTO admin(name, email, nickname, img) VALUES(?,?,?,?)`;
    db.run(
      query,
      [
        bodydata["name"],
        bodydata["email"],
        bodydata["nickname"],
        bodydata["img"],
      ],
      (err) => {
        if (err) {
          console.log(err);
          res.send("Unsuccessful");
        } else {
          // console.log("Your Host table was inserted successfully");
          res.send("Your Admin's table was inserted successfully");
        }
      }
    );
  });
  // ______________________________________ GET ROUTE _______________________________________________
  app.get("/", function (req, res) {
    res.send(
      "Welcome to Ticket-Booth API. Use /events to get all events. Use /participants to get all participants. Use /admin to get all admins."
    );
  });
  // GET EVENTS TABLE
  app.get("/all_events", function (req, res) {
    let query = `SELECT * FROM events`;
    db.all(query, [], (err, rows) => {
      if (err) {
        throw err;
      }
      res.send({ all_events: rows});
    });
  });
  // GET PARTICIPANTS TABLE
  app.get("/participants", function (req, res) {
    let query = `SELECT * FROM participants`;
    db.all(query, [], (err, row) => {
      if (err) {
        throw err;
      }
      res.send({ row });
    });
  });
  // GET ADMIN'S TABLE
  app.get("/admin", function (req, res) {
    let query = `SELECT * FROM admin`;
    db.all(query, [], (err, row) => {
      if (err) {
        throw err;
      }
      res.send({ row });
    });
  });

  app.get("/admin/:user_email", (req, res) => {
    const user_email = req.params.user_email;
    console.log(req.params);

    let query_data = `SELECT * FROM admin WHERE email='${user_email}'`;
    db.get(query_data, (err, rows) => {
      if (err) {
        throw err;
      }
      // res.send({data: query_data});
      res.send({ rows: query_data });
    });
    })
    app.get("/event/:id", function (req, res) {
      let eventId = req.params.id;
      console.log("eventId", eventId);
      let query = `SELECT * FROM events WHERE id=${eventId}`;
      console.log({ query })
      db.get(query, (err, row) => {
        if (err) {
          console.log(err);
          // throw err;
        }
        console.log({ row });
        res.send({ single_event: row });
      });
    });
    app.get("/ticket/:id", function (req, res) {
      let ticket_id = req.params.id;
      console.log("ticket_id", ticket_id);
      let query = `SELECT * FROM participants WHERE id=${ticket_id}`;
      console.log({ query })
      db.get(query, (err, row) => {
        if (err) {
          console.log(err);
          // throw err;
        }
        console.log({ row });
        
        res.send({ single_ticket: row });
      });
    });
  server.listen(port);
  console.log("Server is listening at port: ", port);