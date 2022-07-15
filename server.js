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
      "CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, event_name TEXT NOT NULL, event_description TEXT NOT NULL, ticket_price INT NOT NULL, currency INT NOT NULL, orange_account INT,lonestar_account INT, location TEXT NOT NULL, event_date date, num_participants INT NOT NULL, status TEXT, host_id INT, img url, FOREIGN KEY(host_id) REFERENCES admin(id))"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS tickets(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT NOT NULL,phone_number INT NOT NULL, amount INT, quantity INT, status TEXT, img url)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS admin(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, nickname TEXT,img url UNIQUE)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS participants(id INTEGER PRIMARY KEY AUTOINCREMENT, tickets_id INT, events_id INT, status TEXT, date DATE, FOREIGN KEY(tickets_id) REFERENCES tickets(id), FOREIGN KEY(events_id) REFERENCES events(id))"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS tokens(id INTEGER PRIMARY KEY AUTOINCREMENT, tickets_id INT, participants_id INT, events_id INT, token_code INT, FOREIGN KEY (tickets_id) REFERENCES tickets(id), FOREIGN KEY (events_id) REFERENCES events(id), FOREIGN KEY (participants_id) REFERENCES participants(id))"
    );
  }
  createTable();
  // ____________________________________ POST ROUTE ________________________________________________
// POST TO THE EVENT'S TABLE
app.post("/events", function (req, res) {
  let bodydata = req.body;
  console.log(bodydata);

  let query = `INSERT INTO events(event_name, host_id, event_description, ticket_price, currency, orange_account, lonestar_account, location, event_date, num_participants, status, img) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`;
  db.run(
    query,
    [
      bodydata["event_name"],
      bodydata["host_id"],
      bodydata["event_description"],
      bodydata["ticket_price"],
      bodydata["currency"],
      bodydata["orange_account"],
      bodydata["lonestar_account"],
      bodydata["location"],
      bodydata["event_date"],
      bodydata["num_participants"],
      bodydata["status"],
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

// POST TO THE TICKETS TABLE
app.post("/tickets", function (req, res) {
    let bodydata = req.body;
    console.log(bodydata);
  
    let query = `INSERT INTO tickets(name, address, phone_number, amount, quantity, status, img) VALUES(?,?,?,?,?,?,?)`;
    db.run(
      query,
      [
        bodydata["name"],
        bodydata["address"],
        bodydata["phone_number"],
        bodydata["amount"],
        bodydata["quantity"],
        bodydata["status"],
        bodydata["img"]
      ],
      (err) => {
        if (err) {
          console.log(err);
          res.send("Unsuccessful");
        } else {
          // console.log("Your Host table was inserted successfully");
          res.send("Your Tickets table was inserted successfully");
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
  //  POST TO TPARTICIPANTS TABLE 
  app.post("/participants", function (req, res) {
    let bodydata = req.body;
    console.log(bodydata);
  
    let query = `INSERT INTO participants(tickets_id, events_id, status, date) VALUES(?,?,?,?)`;
    db.run(
      query,
      [
        bodydata["tickets_id"],
        bodydata["events_id"],
        bodydata["status"],
        bodydata["date"],
      ],
      (err) => {
        if (err) {
          console.log(err);
          res.send("Unsuccessful");
        } else {
          
          res.send("Your Ticket's table was inserted successfully");
        }
      }
    );
  });

   //  POST TO TOKENS TABLE 
   app.post("/tokens", function (req, res) {
    let bodydata = req.body;
    console.log(bodydata);
  
    let query = `INSERT INTO tokens(tickets_id, participants_id, events_id, token_code) VALUES(?,?,?,?)`;
    db.run(
      query,
      [
        bodydata["tickets_id"],
        bodydata["participants_id"],
        bodydata["events_id"],
        bodydata["token_code"],
      ],
      (err) => {
        if (err) {
          console.log(err);
          res.send("Unsuccessful");
        } else {
          
          res.send("Your Token's table was inserted successfully");
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
  // GET TICKETS TABLE
  app.get("/tickets", function (req, res) {
    let query = `SELECT * FROM tickets`;
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

  app.get("/admin/:id", (req, res) => {
    const admin_id = req.params.id;
    console.log(admin_id);
    let query_data = `SELECT * FROM admin WHERE id=${admin_id}`;
    // console.log(query_data);
    db.get(query_data, (err, row) => {
      if (err) {
        throw err;
      }
      console.log({row})
      res.send({ single_admin: row });
    });
    })
    app.get("/event/:id", function (req, res) {
      let eventId = req.params.id;
      console.log("eventId", eventId);
      let query = `SELECT * FROM events WHERE id=${eventId}`;
      // console.log({ query })
      db.get(query, (err, row) => {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log({ row });
        res.send({ single_event: row });
      });
    });

//  PAGINATION 
app.get("/next_page/?limit=2", function (req, res) {
  // let offset = req.params.offset;
  // let limit = req.params.limit;
  let query = `SELECT *
               FROM events
             
               ORDER BY event_date ASC`;
  db.all(query, (err, rows)=>{
if(err){
  console.log(err);
  throw err;
}
console.log({rows})
res.send({next_page: rows})
  });
});
// LATEST EVENTS 
app.get("/latest_events", function(req, res){
  let query = `SELECT event_name, num_participants, status, event_date, nickname from events, admin WHERE events.id=admin.id`;
  db.all(query, (err, row)=>{
if(err){
  throw err;
}
console.log({row});
res.send({row: row})
  })

})
// LATEST TICKETS 
app.get("/latest_tickets", function (req, res){
let query = `SELECT event_name, amount, currency, quantity, s`
})
// exeample 
app.get("/try", function(req, res){
  let query = `SELECT * from events, tickets WHERE events.id=tickets.id`;
  db.all(query, (err, row)=>{
if(err){
  throw err;
}
console.log({row});
res.send({row: row})
  })

})
  server.listen(port);
  console.log("Server is listening at port: ", port);