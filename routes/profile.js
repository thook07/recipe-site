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
const File = require('../models/File');
const authZ = require('../config/authorization');
/*
res.sendStatus(200) // equivalent to res.status(200).send('OK')
res.sendStatus(403) // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404) // equivalent to res.status(404).send('Not Found')
res.sendStatus(500) // equivalent to res.status(500).send('Internal Server Error')
*/

router.get('/', async (req, res) => {
    const user = req.user || await User.byId(1);
    user.favorites = await user.getFavoriteRecipes();
    user.groceryList = await user.getGroceryList();

    res.render('profile/account-profile', {
        user: user
    });
});

router.get('/my-recipes', authZ.ensureLoggedIn(), async (req, res) => {
    const user = req.user || await User.byId(1);
    user.favorites = await user.getFavoriteRecipes();
    user.groceryList = await user.getGroceryList();

    res.render('profile/my-recipes', {
        user: user
    });
});

router.get('/my-favorites', authZ.ensureLoggedIn(), async (req, res) => {
    const user = req.user || await User.byId(1);
    user.favorites = await user.getFavoriteRecipes();
    user.groceryList = await user.getGroceryList();

    res.render('profile/my-favorites', {
        user: user
    });
});

router.get('/my-grocery-list', authZ.ensureLoggedIn(), async (req, res) => {
    log.trace("[/my-grocery-list] Entering....");

    var user = req.user || await User.byId(1);
    user.groceryList = await user.getGroceryList();
    log.debug("[/my-grocery-list] Showing Page for my-grocery-list")
    res.render('profile/my-grocery-list', {
        user: user
    });
    
});

router.get('/edit-grocery-list', authZ.ensureLoggedIn(), async (req, res) => {
    log.trace("[/edit-grocery-list] Entering....");

    var user = req.user || await User.byId(1);
    user.groceryList = await user.getGroceryList();
    log.debug("[/edit-grocery-list] Showing Page for my-grocery-list")
    res.render('profile/edit-grocery-list', {
        user: user
    });
    
});







module.exports = router;

