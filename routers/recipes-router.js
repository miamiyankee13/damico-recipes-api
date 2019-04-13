'use strict'
//import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const objectID = require('mongodb').ObjectID;

//import mongoose model
const { Recipe } = require('../models');

//declare JSON parser
const jsonParser = bodyParser.json();

//create new router instance
const router = express.Router();

//GET - retrieve all recipes
router.get('/', (req, res) => {
    return Recipe.find().sort({ name: 1 })
            .then(recipes => {
                return res.json({ recipes: recipes.map(recipe => recipe.serialize())});
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ message: 'Something went wrong'});
            });
});

//export router instance
module.exports = router;