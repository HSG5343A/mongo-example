var express = require('express');
var request = require('request');
var mongoose = require('mongoose');

var app = express();
mongoose.connect('mongodb://localhost/test');

var Article = mongoose.model('Article', { data: String, created_on: Date });

var ARTICLES_API_URL = 'http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/7.json?api-key=e8b9bdd9df337205541989dfd35418e2:1:73520418';


app.get('/news/', function (req, res) {
    var start = new Date();
    start.setHours(0,0,0,0);
    // start.setMonth(2);

    var end = new Date();
    end.setHours(23,59,59,999);

    Article
        .find({created_on: {$gte: start, $lt: end}})
        .exec(function(err, articles) {
            if(err) {
                console.log('Error');
                return res.status(500).send('Something broke!');
            } else {
                if(articles.length === 0) {
                    request(ARTICLES_API_URL, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var allArticles = JSON.parse(body).results;
                            var articlesWithGeo = allArticles.filter(function(article) {
                                return article.geo_facet;
                            });
                            articlesWithGeo.forEach(function(articleData) {
                                var article = new Article({ 
                                    data: JSON.stringify(articleData),
                                    created_on: new Date()
                                });
                                article.save();
                            });
                            res.send(articlesWithGeo);
                        }
                    });
                } else {
                    console.log('pull from db');
                    res.json(articles.map(function(art) {
                        return JSON.parse(art.data);
                    }));
                }
            }
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
