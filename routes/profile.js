const express = require('express');
const log = require('../config/logger');
const fs = require('fs')
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');
const RecipeIngredient = require('../models/RecipeIngredient');
const Ingredient = require('../models/Ingredient');
const Tag = require('../models/Tag');
const File = require('../models/File')

/*
res.sendStatus(200) // equivalent to res.status(200).send('OK')
res.sendStatus(403) // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404) // equivalent to res.status(404).send('Not Found')
res.sendStatus(500) // equivalent to res.status(500).send('Internal Server Error')
*/

router.get('/', (req, res) => {
    res.render('account-profile', {
        user: req.user
    });
});

router.get('/my-recipes', (req, res) => {
    res.render('my-recipes', {
        user: req.user
    });
});

router.get('/my-favorites', async (req, res) => {

    const user = await User.byId(1);
    user.favorites = await user.getFavoriteRecipes();
    console.log(user.favorites)

    res.render('my-favorites', {
        user: user
    });
});

router.get('/my-grocery-list', async (req, res) => {
    log.trace("[/my-grocery-list] Entering....");

    var user = req.user || await User.byId(1);
    user.groceryList = await user.getGroceryList();
    log.debug("[/my-grocery-list] Showing Page for my-grocery-list")
    res.render('my-grocery-list', {
        user: user
    });
    
});

router.get('/edit-grocery-list', async (req, res) => {
    log.trace("[/my-grocery-list] Entering....");

    var user = req.user || await User.byId(1);
    user.groceryList = await user.getGroceryList();
    log.debug("[/my-grocery-list] Showing Page for my-grocery-list")
    res.render('edit-grocery-list', {
        user: user
    });
    
});







module.exports = router;

