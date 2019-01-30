
// load configuration values
require ("dotenv").config();

// include libraries
var express = require ("express"),
    bodyParser = require ("body-parser"),
    ejs = require ("ejs"),
    compression = require ("compression"),
    page = require ("./pagemanager.js"),
    api = require ("./apimanager.js");

// initialize express
var app = express ();
app.set ("port", process.env.RUNTIME_PORT);
app.set ("views", __dirname + "/views/layout");
app.engine ("ejs", ejs.renderFile);
app.use (bodyParser.json({strict: false}));
app.use (compression({level: 1, threshold: 0})); // use fastest compression
app.use (express.static (__dirname + "/public"));

// handle api requests
app.all ("/api/*", function (req, res) {
    api.process(req, res);
});

// evaluate the path to load content
app.get ("*", function (req, res) {
    page.display (res, "index");
});

// start the server
app.listen (process.env.RUNTIME_PORT);
console.log("Node app is running at localhost on port " + process.env.RUNTIME_PORT + ".");
