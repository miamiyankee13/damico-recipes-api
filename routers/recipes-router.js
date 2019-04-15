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

//GET - retrieve all recipes by meal
router.get('/meals/:meal', (req, res) => {
    return Recipe.find({ meal: req.params.meal}).sort({ name: 1 })
            .then(recipes => {
                return res.json({ recipes: recipes.map(recipe => recipe.serialize())});
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ message: 'Something went wrong'});
            });
});

//GET - retrieve all recipes by type
router.get('/types/:type', (req, res) => {
    return Recipe.find({ type: req.params.type}).sort({ name: 1 })
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

//PUT - update a recipe
router.put('/:id', jsonParser, (req, res) => {
    if (!objectID.isValid(req.params.id)) {
        const message = 'Bad ID';
        console.error(message);
        return res.status(400).json({ message });
    }

    return Recipe.findById(req.params.id)
            .then(recipe => {
                if (!recipe) {
                    const message = 'ID not found'
                    console.error(message);
                    return res.status(400).json({ message });
                } else {
                    console.log('ID validated');
                }

                if (!(req.params.id && req.body._id && req.params.id === req.body._id)) {
                    const message = `Request path id ${req.params.id} and request body id ${req.body._id} must match`;
                    console.error(message);
                    return res.status(400).json({ message });
                }

                const updatedRecipe = {};
                const updateableFields = ['name', 'ingredients', 'instructions', 'sides', 'meal', 'type'];
                updateableFields.forEach(field => {
                    if (field in req.body) {
                        updatedRecipe[field] = req.body[field];
                    }
                });

                return Recipe.findByIdAndUpdate(recipe._id, { $set: updatedRecipe }, { new: true })
                        .then(recipe => {
                            return res.status(200).json(recipe.serialize());
                        })
                        .catch(err => {
                            console.error(err);
                            return res.status(500).json({ message: 'Something went wrong'});
                        });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ message: 'Something went wrong'});
            });
});

//export router instance
module.exports = router;