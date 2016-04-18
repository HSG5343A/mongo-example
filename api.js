var express = require('express');
var mongoose = require('mongoose');
var request = require('request');

var app = express();
mongoose.connect('mongodb://localhost/test');

var ARTICLES_API_URL = 'http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/7.json?api-key=e8b9bdd9df337205541989dfd35418e2:1:73520418';


var Article = mongoose.model('Article', { created: Date, content: String});

app.get('/api/articles/', function (req, res) {
    var start = new Date();
    start.setHours(0,0,0,0);

    var end = new Date();


    Article
        .find({
            created: {
                $gte: start,
                $lt: end
            }
        })
        .exec(function(error, articles) {
        if(error) {
            console.log("Error!!!");
            return res.status(500).send("Something went terribly wrong");
        }

        if(articles.length > 0) {
            // there are articles in our database
            console.log('sending articles from database');
            var responseData = [];
            for(var i=0; i<articles.length; i++) {
                var arts = JSON.parse(articles[i].content);
                responseData = responseData.concat(arts);
            }
            res.send(responseData);
        } else {
            // no articles in db
            // connect to NYT API
            console.log('calling NYT API');
            request(ARTICLES_API_URL, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var allArticles = JSON.parse(body).results;

                    // OLD WAY
                    // var articlesWithGeo = [];
                    // for (var i=0; i<allArticles.length; i++) {
                    //     if(allArticles[i].geo_facet) {
                    //         articlesWithGeo.push(allArticles[i]);
                    //     }
                    // }

                    // NEW WAY - using Array.filter()
                    var articlesWithGeo = allArticles.filter(function(article) {
                        return article.geo_facet;
                    });

                    var created = new Date();
                    var article = new Article({
                        created:  created,
                        content: JSON.stringify(articlesWithGeo)
                    });
                    
                    article.save();

                    res.send(articlesWithGeo);
                }
            });
        }
    });
    

  // res.send('Done!');
});

app.get('/map.html', function(req, res) {
    res.sendFile(__dirname + '/map.html');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});