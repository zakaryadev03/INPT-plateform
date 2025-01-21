const express = require('express');
const path = require('path');
const app = express();
const cors = require("cors")
const cookieParser = require('cookie-parser');
//CORS 

var allowlist = ['http://localhost:3000', 'http://example2.com']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  corsOptions = {...corsOptions,    credentials: true,  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({path:"backend/config/config.env" });
}
//using the middlewares
console.log(path.join(__dirname, 'public'));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(cors(corsOptionsDelegate))
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

//importing the routes
const post = require("./routes/post");
const user = require("./routes/user");
const { log } = require('console');

//using the routes
app.use("/api/v1", post);
app.use("/api/v1", user);

module.exports = app;