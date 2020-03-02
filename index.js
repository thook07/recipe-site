const express = require('express');
const app = express();
const recipes = require('./recipes.json')
const recipe1 = require('./recipe1.json')
const recipe2 = require('./recipe2.json')
const tags = require('./tags.json')


app.set('view engine', 'pug');
app.use(express.static(__dirname + '/src'))


const server = app.listen(3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});


// -- Home Page
app.get('/', (req, res) => {
    console.log("Showing home page...");
    res.render('index', {
        recipes: recipes,
        tags: tags
    });
});


app.get('/recipe/:recipe', (req, res) => {
    console.log("Showing recipe page...");

    var recipeVar = req.params.recipe;
    var passVar = recipe2;

    console.log("Recipe: ", recipeVar);

    if( recipeVar == "nourish-bowls" ){
        passVar = recipe1;
    }


    res.render('grocery-single', {
        recipe: passVar,
        tags: tags
    });
});


app.get('/grocery-single', (req, res) => {
    res.render('grocery-single', {
        recipe: recipe2,
        tags: tags
    })
});


