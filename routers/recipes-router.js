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

//POST - create recipe
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['name', 'ingredients', 'instructions', 'sides', 'meal', 'type'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        const message = `Missing ${missingField} in request body`;
        console.error(message);
        return res.status(400).json({ message });
    }

    return Recipe.findOne({ name: req.body.name })
            .then(recipe => {
                if (recipe) {
                    const message = 'Recipe already exists';
                    console.error(message);
                    return res.status(400).json({ message });
                } else {
                    return Recipe.create({
                        name: req.body.name,
                        ingredients: req.body.ingredients,
                        instructions: req.body.instructions,
                        sides: req.body.sides,
                        meal: req.body.meal,
                        type: req.body.type
                    })
                    .then(recipe => {
                        return res.status(201).json(recipe.serialize());
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(400).json({ message: 'Bad request' });
                    });
                }
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ message: 'Something went wrong'});
            });
});

//export router instance
module.exports = router;