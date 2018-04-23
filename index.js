const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
mongoose.connect('mongodb://localhost/test');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var storiesSchema = mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    publishDate: Date
})

var Story = mongoose.model("Story", storiesSchema);

app.get('/api/stories/', function(request, response) {
    Story.find({}, function(err, items) {
        response.json(items);
    })
});

app.route('/form.html')
    .post(function(req, response) {
        var storyInfo = req.body;
        var newStory = new Story({
            title: storyInfo.title,
            description: storyInfo.description
        })
        newStory.save(function(err, res) {
            response.sendFile(__dirname + '/form.html');
        })
    })
    .get(function (request, response) {
        response.sendFile(__dirname + '/form.html');
    });


app.listen(5000, function () {
    console.error(`Listening on port 5000`);
});
