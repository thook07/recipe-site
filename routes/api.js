const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const Tag = require('../models/Tag');

/*
res.sendStatus(200) // equivalent to res.status(200).send('OK')
res.sendStatus(403) // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404) // equivalent to res.status(404).send('Not Found')
res.sendStatus(500) // equivalent to res.status(500).send('Internal Server Error')
*/

router.get('/', (req, res) => {
    res.send('API HOME');
});

router.get('/recipes', async (req, res) => {
    res.send( await Recipe.findAll() );
});

router.get('/recipes/id', async (req, res) => {
    const recipes = await Recipe.findAll({ attributes: ['id'] })

    recipeIds = []
    recipes.forEach(recipe => { recipeIds.push(recipe.id) })

    res.send(recipeIds)
});

router.post('/recipes/add', async (req, res) => {
    const data = req.body.recipe;
    try {
        console.log(data);
        const recipe = Recipe.build(data);
        console.log(recipe);
        await recipe.save();
        


        //const recipe = await Recipe.create( data );

        res.status(200)
        res.send("Success");
    } catch(err) {
        res.status(400);
        res.send(err.errors[0].message);
    }
    
});

router.get('/tags/', async (req, res) => {
    res.send( await Tag.findAll())
});







module.exports = router;

