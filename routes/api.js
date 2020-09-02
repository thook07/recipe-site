const express = require('express');
const log = require('../config/logger');
const fs = require('fs')
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const GroceryListRecipe = require('../models/GroceryListRecipe');
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
    res.send('API HOME');
});

router.get('/users', async (req, res) => {
    const users = await User.findAll();
    // Compile the source code
    res.render('helpers/user-table', {
        users: users
    });
});

router.post('/favorite/add', async (req, res) => {
    log.trace('[/api/favorite/add] Starting...');
    const userId = req.body.userId;
    const recipeId = req.body.recipeId;
    log.trace('[/api/favorite/add] UserID: ' + userId);
    log.trace('[/api/favorite/add] RecipeID: ' + recipeId);

    try {
        const favorite = Favorite.build({
           userId: userId,
           recipeId: recipeId 
        });
        console.log(favorite);
        await favorite.save();
        res.status(200)
        res.send("Successfully added favorite for " + userId);
    } catch(err) {
        console.log(err);
        res.status(400);
        res.send(err);
    }
});

router.post('/favorite/remove', async (req, res) => {
    log.trace('[/api/favorite/remove] Starting...');
    const userId = req.body.userId;
    const recipeId = req.body.recipeId;
    log.trace('[/api/favorite/remove] UserID: ' + userId);
    log.trace('[/api/favorite/remove] RecipeID: ' + recipeId);

    try {
        const favorite = await Favorite.getByIds(userId, recipeId);
        console.log(favorite);
        await favorite.destroy();
        res.status(200)
        res.send("Successfully added favorite for " + userId);
    } catch(err) {
        console.log(err);
        res.status(400);
        res.send(err);
    }
});

router.post('/groceryList/add', async (req, res) => {
    log.trace('[/api/groceryList/add] Starting...');
    const userId = req.body.userId;
    const recipeId = req.body.recipeId;
    const quantity = req.body.quantity
    log.trace('[/api/groceryList/add] UserID: ' + userId);
    log.trace('[/api/groceryList/add] RecipeID: ' + recipeId);
    log.trace('[/api/groceryList/add] Quantity: ' + quantity);

    /*const recipe = await Recipe.findOne({
        where: {
            id: recipeId
        },
        include: [RecipeIngredient]
    })

    for(const ri of recipe.recipeIngredients) {

    }*/

    try {
        var list = await GroceryListRecipe.findOne({
            where: {
                userId: userId,
                recipeId: recipeId
            }
        })
        if(list) {
            //recipe already in list. Increaing Quantity
            await list.increment({
                quantity: quantity
            })
        } else {
            //recipe not in list. Adding it with quantity
            list = GroceryListRecipe.build({
                userId: userId,
                recipeId: recipeId,
                quantity: quantity 
             });
        }
        await list.save();
        res.status(200)
        res.send("Successfully added favorite for " + userId);
    } catch(err) {
        log.error(err);
        res.status(400);
        res.send(err);
    }
});

router.post('/groceryList/remove', async (req, res) => {
    log.trace('[/api/groceryList/remove] Starting...');
    const userId = req.body.userId;
    const recipeId = req.body.recipeId;
    log.trace('[/api/groceryList/remove] UserID: ' + userId);
    log.trace('[/api/groceryList/remove] RecipeID: ' + recipeId);

    try {
        await GroceryListRecipe.destroy({
            where: {
                userId: userId,
                recipeId: recipeId
            }
        });
        res.status(200)
        res.send("Successfully removed recipe from grocery list for " + userId);
    } catch(err) {
        log.error(err);
        res.status(400);
        res.send(err);
    }
});

router.post('/groceryList/update', async (req, res) => {
    log.trace('[/api/groceryList/update] Starting...');
    const userId = req.body.userId;
    const changes = req.body.changes;
    log.trace('[/api/groceryList/update] UserID: ' + userId);
    log.trace('[/api/groceryList/update] changes: ' + JSON.stringify(changes));

    for (var change in changes) {
        var recipeId = changes[change].recipeId;
        var quantity = changes[change].quantity;

        if(quantity > 0 ) {
            log.trace('[/api/groceryList/update] Updating ' + recipeId + '\'s quantity to ' + quantity);
            await GroceryListRecipe.update({ quantity: quantity }, {
                where: {
                recipeId,
                userId
                }
            });
        } else {
            log.trace('[/api/groceryList/update] Deleting ' + recipeId + ' from list.');
            await GroceryListRecipe.destroy({
                where: {
                    recipeId,
                    userId
                }
            });
        }

          
    }
    //for now we are just assuming it all works..
    res.status(200)
    res.send("Successfully removed recipe from grocery list for " + userId);
});


router.get('/recipes', async (req, res) => {
    res.send( await Recipe.findAll() );
});

router.get('/recipes/id', async (req, res) => {
    res.send( await Recipe.getIds() );
});

router.get('/recipes/:recipe/images', async (req, res) => {
    log.trace('GET [api/recipes/recipe:/images] Entering: ' + req.params.recipe)
    var recipeId = req.params.recipe;
    recipe = await Recipe.byId(recipeId)
    if(recipe) {
        res.status(200).send( recipe.images);
    } else {
        res.status(404).send('Recipe with id '+recipeId+' not found')
    }
    
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

router.post('/recipes/:recipe/update', async (req, res) => {
    log.trace('POST [api/recipes/recipe:/update] Entering: ' + req.params.recipe)
    var recipeId = req.params.recipe;
    console.log(req.body);
    var attMap = req.body.attributes;
    log.trace('Searching for ' + recipeId);
    recipe = await Recipe.byId(recipeId)
    if(recipe) {
        log.trace('Found ['+recipeId+']. Update attributes.');
        log.trace(JSON.stringify(attMap));
        for(var key in attMap){
            recipe[key] = attMap[key];
        }
        log.debug('Updating Recipe ['+recipeId+']!')
        try {
            await recipe.save();
            res.status(200).send('Successfully updated '+recipeId);
        } catch(err) {
            res.status(500).send(err)
        }
    } else {
        res.status(404).send('Recipe with id '+recipeId+' not found')
    }
});

router.post('/upload/recipe-images', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let file = req.files.file;
            userId = 1;
            if( req.user) {
                userId = req.user.id;
            }
            
            const uploadPath = './uploads/recipe-images/' + file.name
            /*if (fs.existsSync(uploadPath)) {
                log.error('[/admin/upload/recipe-images] Error Uploading File: File Name already exists. Try renaming the file.');
                res.status(500).send('File Name already exists. Try renaming the file.');
                return
            }*/



            file.mv(uploadPath);
            log.trace('Stored @ ' + uploadPath);
            //remove the uploads folder from the path
            publicUrl = uploadPath.substring(9, uploadPath.length)
            log.trace('New URL: ' + publicUrl)

            var fileData = {
                name: file.name,
                size: file.size,
                type: file.mimetype,
                path: publicUrl,
                userId: userId
            }

            


            const fileObj = await File.build( fileData )
            await fileObj.save();

            //send response
            log.trace('/admin/upload/recipe-images] File ['+file.name+'] Successfully upload!')
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: file.name,
                    mimetype: file.mimetype,
                    size: file.size,
                    path: publicUrl
                }
            });
        }
    } catch (err) {
        log.error('/admin/upload/recipe-images] File Upload Error:');
        console.log(err);
        res.status(500).send(err);
    }
});

router.get('/recipe-ingredients', async (req, res) => {
    const recipeIngs = await RecipeIngredient.findAll();
    // Compile the source code
    res.render('helpers/recipeIngredients-table', {
        recipeIngredients: recipeIngs
    });
});

router.get('/ingredients', async (req, res) => {
    const ingredients = await Ingredient.findAll();
    // Compile the source code
    res.render('helpers/ingredients-table', {
        ingredients: ingredients
    });
});

router.post('/ingredient/update', async (req, res) => {
    log.debug('[/api/ingredient/update] Entering.')
    const ingRequest = req.body.ingredient;
    log.trace('[/api/ingredient/update] Ingredient Requested:' + JSON.stringify(ingRequest));
    try {
        log.debug('[/api/ingredient/update] Updating Ingredient with id: ' + ingRequest.id);
        const ingredient = await Ingredient.update({ name: ingRequest.name, categoryId: ingRequest.categoryId }, {
            where: {
                id: ingRequest.id
            }
        });
        log.debug('[/api/ingredient/update] Updated!');
        
        res.status(200);
        res.send("Success");
    } catch(err) {
        console.log(err);
        log.error(JSON.stringify(err))
        res.status(400);
        res.send(err);
    }
    
});

router.get('/tags/', async (req, res) => {
    const tags = await Tag.findAll();
    // Compile the source code
    res.render('helpers/tags-table', {
        tags: tags
    });
});

router.get('/grocery-cart', async (req, res) => {
    var user = req.user || await User.byId(1);
    if(user) {
        //log.trace('[/] User: ' + req.user.email)
        //log.trace('[/] User Role: ' + req.user.role)
        userId = user.id
        user.groceryList = await user.getGroceryList();
        res.status(200)
        res.render('recipe-partials/cart-dropdown-return', {
            user: user
        });
    } else{
       log.error('[api/grocery-cart] No User Logged in! Cant send groceryList');
       res.status(400).send('No User Logged in! Cant send groceryList')

    }



    
});






module.exports = router;

