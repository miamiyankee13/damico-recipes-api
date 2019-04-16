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
            let responseRecipe;
            return chai.request(app)
                    .get('/api/recipes')
                    .then(function(res) {
                        responseRecipe = res.body.recipes[0];
                        return chai.request(app)
                                .get(`/api/recipes/${responseRecipe._id}`)
                    })
                    .then(function(res) {
                        expect(responseRecipe._id).to.equal(res.body._id);
                        expect(responseRecipe.name).to.equal(res.body.name);
                        expect(responseRecipe.meal).to.equal(res.body.meal);
                        expect(responseRecipe.type).to.equal(res.body.type);
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
});