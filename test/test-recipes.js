'use strict'
//import dependencies
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

//import modules
const { Recipe } = require('../models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

//enable 'expect' style syntax
const expect = chai.expect;

//enable use of chai-http testing methods
chai.use(chaiHttp);

//create random recipe data
function generateRecipeData() {
    return {
        name: faker.lorem.words(),
        ingredients: [faker.lorem.word(), faker.lorem.word()],
        instructions: [faker.lorem.sentence(), faker.lorem.sentence()],
        sides: [faker.lorem.word(), faker.lorem.word()],
        meal: 'breakfast',
        type: 'eggs'
    }
}

//add 2 recipes to database
function seedRecipeData() {
    console.log('Seeding recipe data');
    const seedData = [];
    for (let i = 0; i < 2; i++) {
        seedData.push(generateRecipeData());
    }
    return Recipe.insertMany(seedData);
}

//tear down database
function tearDownDb() {
    console.log('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Recipe Endpoints', function() {
    
    before(function() {
        return runServer(TEST_DATABASE_URL);
    });
    
    beforeEach(function() {
        return tearDownDb().then(seedRecipeData);
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('GET Endpoints', function() {

        it('Should return all existing recipes', function() {
            let response;
            return chai.request(app)
                    .get('/api/recipes')
                    .then(function(res) {
                        response = res;
                        expect(response).to.have.status(200);
                        expect(response).to.be.json
                        return Recipe.countDocuments();
                    })
                    .then(function(count) {
                        expect(response.body.recipes).to.have.lengthOf(count);
                    })
                    .catch(function(err) {
                        if (err instanceof chai.AssertionError) {
                            throw err;
                        }
                    });
        });

        it('Should return individual recipe', function() {
            let recipe;
            return chai.request(app)
                    .get('/api/recipes')
                    .then(function(res) {
                        recipe = res.body.recipes[0];
                        return chai.request(app)
                                .get(`/api/recipes/${recipe._id}`)
                    })
                    .then(function(res) {
                        expect(res.body._id).to.equal(recipe._id);
                        expect(res.body.name).to.equal(recipe.name);
                        expect(res.body.meal).to.equal(recipe.meal);
                        expect(res.body.type).to.equal(recipe.type);
                    })
                    .catch(function(err) {
                        if (err instanceof chai.AssertionError) {
                            throw err;
                        }
                    });
        });

        it('Should return all existing recipes by meal', function() {
            let response;
            return chai.request(app)
                    .get('/api/recipes/meals/breakfast')
                    .then(function(res) {
                        response = res;
                        expect(response).to.have.status(200);
                        expect(response).to.be.json
                        return Recipe.countDocuments();
                    })
                    .then(function(count) {
                        expect(response.body.recipes).to.have.lengthOf(count);
                    })
                    .catch(function(err) {
                        if (err instanceof chai.AssertionError) {
                            throw err;
                        }
                    });
        });

        it('Should return all existing recipes by type', function() {
            let response;
            return chai.request(app)
                    .get('/api/recipes/types/eggs')
                    .then(function(res) {
                        response = res;
                        expect(response).to.have.status(200);
                        expect(response).to.be.json
                        return Recipe.countDocuments();
                    })
                    .then(function(count) {
                        expect(response.body.recipes).to.have.lengthOf(count);
                    })
                    .catch(function(err) {
                        if (err instanceof chai.AssertionError) {
                            throw err;
                        }
                    });
        });
    });

    describe('POST Endpoints', function() {

        it('Should create a new recipe', function() {
            const newRecipe = generateRecipeData();
            return chai.request(app)
                    .post('/api/recipes')
                    .send(newRecipe)
                    .then(function(res) {
                        expect(res).to.have.status(201);
                        expect(res).to.be.json;
                        expect(res.body).to.be.a('object');
                        expect(res.body).to.include.keys('_id', 'name', 'ingredients', 'instructions', 'sides', 'meal', 'type');
                        expect(res.body._id).to.not.be.null;
                        expect(res.body.name).to.equal(newRecipe.name);
                        expect(res.body.meal).to.equal(newRecipe.meal);
                        expect(res.body.type).to.equal(newRecipe.type);
                        return Recipe.findById(res.body._id);
                    })
                    .then(function(recipe) {
                        expect(recipe.name).to.equal(newRecipe.name);
                        expect(recipe.meal).to.equal(newRecipe.meal);
                        expect(recipe.type).to.equal(newRecipe.type);
                    })
                    .catch(function(err) {
                        if (err instanceof chai.AssertionError) {
                            throw err;
                        }
                    });
        });

    });
});