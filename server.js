'use strict'
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const { PORT, DATABASE_URL, CLIENT_ORIGIN } = require('./config');

mongoose.Promise = global.Promise; 

const app = express();

app.use(morgan('common'));

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.get('/', (req, res, next) => {
    res.json({message: "hello!"})
});

app.use('*', (req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  let server;

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

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };