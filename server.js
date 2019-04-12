'use strict'
//import dependencies
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

//import config variables
const { PORT, DATABASE_URL, CLIENT_ORIGIN } = require('./config');

const { Recipe } = require('./models');

//configure mongoose to use ES6 promises
mongoose.Promise = global.Promise; 

//create new app instance
const app = express();

//middleware - logging & CORS
app.use(morgan('common'));
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

//initial route
app.get('/', (req, res) => {
    return Recipe.find().sort({ name: 1 })
            .then(recipes => {
                return res.json({ recipes: recipes.map(recipe => recipe.serialize())});
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ message: 'Something went wrong'});
            });
});

//catch all handler
app.use('*', (req, res) => {
    res.status(404).json({ message: "Not found" });
  });


let server;

//coordinate connection to database and running of HTTP server
function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            databaseUrl, { useNewUrlParser: true },
            err => {
                if (err) {
                    return reject(err);
                }
                server = app
                .listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on("error", err => {
                    mongoose.disconnect();
                    reject(err)
                }); 
            }
        );
    });
}

//coordinate disconnection from database and shutting down of HTTP server
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

//make file an executable script and a module
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

//export modules for testing
module.exports = { app, runServer, closeServer };