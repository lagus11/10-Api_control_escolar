const bodyparser = require('body-parser');
const express = require('express');

const alumnoroute = require('./router/alumno.router')();

let app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.use('/v1/alumno',alumnoroute);

module.exports = app;

//


