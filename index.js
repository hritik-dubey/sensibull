const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://bkrajor:Bk.190196@cluster0.bn0kl.mongodb.net/sensibull", {useNewUrlParser: true})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});

// mongodb+srv://functionup-satyam:p7HSKjQGHouUtpz2@cluster0.g7bom.mongodb.net/satyam0801-DB?retryWrites=true&w=majority"