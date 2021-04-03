const express = require('express');
const app = express();
const port = 3001;
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const states = ['Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Federated States of Micronesia','Florida','Georgia','Guam','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Marshall Islands','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Northern Mariana Islands','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
const countries = ['United States'];

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "registration"
});

con.connect(function(err) {
  if (err) throw err;
  const createTable = `CREATE TABLE IF NOT EXISTS registered_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(30) NOT NULL,
    lastname VARCHAR(30) NOT NULL,
    address1 VARCHAR(100) NOT NULL,
    address2 VARCHAR(100) NULL DEFAULT '',
    city VARCHAR(50) NOT NULL,
    state VARCHAR(30) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    country VARCHAR(30) NOT NULL
  )`
  
  con.query("CREATE DATABASE IF NOT EXISTS registration", function (err, result) {
    if (err) throw err;
  });
  con.query(createTable, function (err, result) {
    if (err) throw err;
  });
});


app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());

const validationRules = [
  body('firstname').notEmpty().bail().trim().escape().isLength({ min: 1 }),
  body('lastname').notEmpty().bail().trim().escape().isLength({ min: 1 }),
  body('address1').notEmpty().bail().trim().escape().isLength({ min: 1 }),
  body('city').notEmpty().bail().trim().escape().isLength({ min: 1 }),
  body('state').notEmpty().bail().trim().escape().isIn(states),
  body('zip').notEmpty().bail().trim().escape().matches(/^\d{5}(-\d{4})?$/),
  body('country').notEmpty().bail().trim().escape().isIn(countries),
];

const checkRules = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  next();
};

app.post(
  '/',
  validationRules,
  checkRules,
  (req, res) => {
    const { firstname, lastname, address1, address2 = "", city, state, zip, country } = req.body;
    var sql = `INSERT INTO registered_users (
        firstname,
        lastname,
        address1,
        address2,
        city,
        state,
        zip,
        country
      ) 
      VALUES (
        "${firstname}",
        "${lastname}",
        "${address1}",
        "${address2}",
        "${city}",
        "${state}",
        "${zip}",
        "${country}"
      )`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      con.query('SELECT LAST_INSERT_ID()', (err, result) => {
        if (err) throw err;
        res.send(result[0]);
      })
    });
  });

app.get(
  '/',
  (req, res) => {
    if(req.query.id) {
      con.query(`SELECT * FROM registered_users WHERE id=${req.query.id}`, (err, result) => {
        if (err) throw err;
        res.send(result[0]);
      });
    } else {
      con.query(`SELECT * FROM registered_users`, (err, result) => {
        if (err) throw err;
        res.send(result);
      });
    }
  });

app.listen(port);
