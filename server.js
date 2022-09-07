const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const req = require("express/lib/request");
const { response, query } = require("express");
const app = express();
const server = http.createServer(app);
require('dotenv').config()
const axios = require('axios').default;
const { makePayment, getCollection } = require('./helpers/utils');
// const fetch = require("node-fetch");
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
let payments_response;
let port = process.env.PORT || 3200;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let db = new sqlite3.Database("tickets.db");

function createTable() {
  db.run(
    "CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, event_name TEXT NOT NULL, event_description TEXT NOT NULL, ticket_price INT NOT NULL, currency INT NOT NULL, orange_account INT,lonestar_account INT, location TEXT NOT NULL, event_date date, num_participants INT NOT NULL, status TEXT, host_id INT, img url, FOREIGN KEY(host_id) REFERENCES admin(id))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS tickets(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT NOT NULL, msisdn INT NOT NULL, amount INT NOT NULL, currency TEXT NOT NULL, quantity INT NOT NULL, status TEXT NOT NULL, event_name TEXT NOT NULL, transaction_date NOT NULL, img TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS admin(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, nickname TEXT,img TEXT UNIQUE)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS participants(id INTEGER PRIMARY KEY AUTOINCREMENT, tickets_id INT, events_id INT, status TEXT, date DATE, FOREIGN KEY(tickets_id) REFERENCES tickets(id), FOREIGN KEY(events_id) REFERENCES events(id))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS tokens(id INTEGER PRIMARY KEY AUTOINCREMENT, tickets_id INT, participants_id INT, events_id INT, token_code INT, FOREIGN KEY (tickets_id) REFERENCES tickets(id), FOREIGN KEY (events_id) REFERENCES events(id), FOREIGN KEY (participants_id) REFERENCES participants(id))"
  );
  // db.run(
  //   "CREATE TABLE IF NOT EXISTS ponitor_tokens(id INTEGER PRIMARY KEY AUTOINCREMENT, app_id TEXT, app_secret TEXT)"
  // );
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
      bodydata["token_code"]
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

app.post("/tickets", async function (req, res) {
  let info_data;
  let transaction_id;
  info_data = req.body;
  console.log("This is it: ", info_data);
  let name = info_data.name;
  let address = info_data.address;
  let amount = info_data.amount;
  let msisdn = info_data.msisdn;
  let currency = info_data.currency.toLowerCase();
  let external_id = info_data.external_id;
  let event_name = info_data.event_name;
  let transaction_date;
  let status;
  let img;
  let quantity;
  console.log(name, address, amount, event_name);
  console.log({ currency, amount, msisdn, external_id });

  payments_response = await makePayment({
    amount,
    msisdn,
    external_id,
    currency
  });
// console.log({payments_response});
  if (payments_response) {
    transaction_date = payments_response.created_at;
    transaction_id = payments_response.id;
    status = payments_response.status;
  }

  console.log({ payments_response, transaction_date, transaction_id, status });
 

  // POST TO THE TICKETS TABLE 
  let query = `INSERT INTO tickets(name, address, msisdn, amount, currency, quantity, status, event_name, transaction_date, img) VALUES(?,?,?,?,?,?,?,?,?,?)`;
  db.run(
    query,
    [
      name,
      address,
      msisdn,
      amount,
      currency,
      quantity,
      status,
      event_name,
      transaction_date,
      img,
    ],

    (err) => {
      if (err) {
        console.log(err);
        res.send("Unsuccessful");
      } else {
        res.send("Your Host table was inserted successfully");

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
    res.send({ all_events: rows });
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

app.get("/event/:id", function (req, res) {
  let eventId = req.params.id;
  console.log("eventId", eventId);
  let query = `SELECT * FROM events WHERE id=${eventId}`;
  db.get(query, (err, row) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log({ row });
    res.send({ single_event: row });
  });
});
app.get("/ticket/:id", function (req, res) {
  let ticketId = req.params.id;
  console.log("ticketId", ticketId);
  let query = `SELECT * FROM tickets WHERE id=${ticketId}`;
  db.get(query, (err, row) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log({ row });
    res.send({ single_ticket: row });
  });
});

// ADMIN DATA 
app.get("/ticket_info/:event_name", function (req, res) {

  try {
    let event_name = req.params.event_name;
    let query = `SELECT * FROM tickets WHERE event_name=${event_name}`;
    db.all(query, (err, row) => {
      if (err) {
        throw err;
      }
      console.log({ row });
      res.send({ Event_tickets: row });
    })
  } catch (error) {
    console.log(error);
  }
})
// GET COLLECTION 
app.get("/get_collection", async function (req, res) {

  try {
    let collectionResult;
    if (payments_response) {
      // console.log("We have it here: ", payments_response);
      let transaction_id = payments_response.id;
      const collection_token = await axios({
        method: 'post',
        url: process.env.PONITOR_TOKEN_URL,
        data: {
          "app_id": process.env.APP_ID,
          "app_secret": process.env.APP_SECRET
        }

      });
      let token_result = collection_token.data.data.token;

      if (token_result) {
        const get_collection = await axios({

          url: `https://api.ponitor.com/v1/momo/collect?id=${transaction_id}`,
          headers: { 'Authorization': 'Bearer ' + token_result }
        })
        collectionResult = get_collection.data.data.transactions;
        console.log({collectionResult});
        res.send({collectionResult});
      }
    }
  } catch (error) {
    console.log(error);
  }
});
server.listen(port);
console.log("Server is listening at port: ", port);