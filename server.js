//D E P E N D E N C I E S
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");
 //for mongo scraping
var cheerio = require("cheerio");

var axios = require("axios");

// Require all models
var db = require("./models");

var PORT = 3000;

//Initialize Express
var app = express();

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Use morgan logger for logging requests
app.use(logger("dev"));

// //Hook mongojs config to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(err) {
//     console.log("Database Error: " + error);
// });

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newsScraper");

//R O U T E S
//retrieve data scraped from the website
app.get("/scrape", function(req, res) {
    //make request for website
    axios.get("https://www.nytimes.com/section/world").then(function(response) {
        //load the html body from request into cheerio
        var $ = cheerio.load(response.data);
        var scrapedArticles = [];
        //for each element with _______ class
        $("div.story-meta").each(function(i, element) {
            //save the text and href of each link enclosed in the current element
            var result = {};
            result.link = $(element).parent("a").attr("href");
            result.title = $(element).children("h2").text();
            result.summary = $(element).children("p").text();
            result.image = $(element).next().children("img").attr("src");
            //if result.link = existing link in the scrapedArticles array then do not proceed, otherwise, push and save to db
            scrapedArticles.push(result);
    });
        // Insert the data in the db
        console.log(scrapedArticles);
        db.Article.create(scrapedArticles).then(function(dbArticle) {
            // console.log("scraped!");
            // res.send(dbArticle);
        }).catch(function(err) {
            return res.json(err);
        });
    // res.send("Scrape complete!");

});
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });



// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    console.log(req.params.id);
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        console.log(dbArticle);
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    console.log(req.body);
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/notes/:id", function(req, res) {
//     // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//     console.log(req.params.id);
//     db.Note.findOne({ _id: req.params.id })
//       // ..and populate all of the notes associated with it
//       .populate("note")
//       .then(function(dbArticle) {
//         // If we were able to successfully find an Article with the given id, send it back to the client
//         console.log(dbArticle);
//         res.json(dbArticle);
//       })
//       .catch(function(err) {
//         // If an error occurred, send it to the client
//         res.json(err);
//       });
//   });



// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000! http://localhost:"+ PORT);
    console.log("****************************************************************");
});
  