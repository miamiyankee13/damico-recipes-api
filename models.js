'use strict'
//import dependencies
const mongoose = require('mongoose');

//configure mongoose to use ES6 promises & createIndex
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

//create recipe schema
const recipeSchema = mongoose.Schema({
    name: { type: String, required: true },
    ingredients: [{ type: String, required: true }],
    instructions: [{ type: String, required: true }],
    sides: [{ type: String, required: true }],
    meal: { type: String, required: true },
    type: { type: String, required: true }
});

//create method to control data sent to client
recipeSchema.methods.serialize = function() {
    return {
        _id: this.id,
        name: this.name,
        ingredients: this.ingredients,
        instructions: this.instructions,
        sides: this.sides,
        meal: this.meal,
        type: this.type
    }
}

//create mongoose model
const Recipe = mongoose.model('Recipe', recipeSchema);

//export mongoose model
module.exports = { Recipe };