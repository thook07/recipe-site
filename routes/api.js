const express = require('express');
const log = require('../config/logger');
const fs = require('fs')
const pug = require('pug')
const nodemailer = require('../config/emailer')
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const GroceryListRecipe = require('../models/GroceryListRecipe');
const Favorite = require('../models/Favorite');
const RecipeIngredient = require('../models/RecipeIngredient');
const Ingredient = require('../models/Ingredient');
const Tag = require('../models/Tag');
const RecipeTag = require('../models/RecipeTag')
const File = require('../models/File')

/*
res.sendStatus(200) // equivalent to res.status(200).send('OK')
res.sendStatus(403) // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404) // equivalent to res.status(404).send('Not Found')
res.sendStatus(500) // equivalent to res.status(500).send('Internal Server Error')
*/
module.exports = function(app, sequelize){ 
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

    router.get('/users/email', async (req, res) => {
        const emails = await User.findAll({ attributes: ['email']})
        res.status(200).send(emails)
    });

    router.post('/user/add', async (req, res) => {
        log.debug('[/api/user/add] Entering..');
        var userRequest = req.body.user
        log.trace('[/api/user/add] User JSON: ' + JSON.stringify(userRequest));
        try {
            const user = await User.create({ 
                email: userRequest.email,
                password: userRequest.password,
                role: userRequest.role
            })
            res.status(200).send('Successfully Created User with Id: ' + user.id)
        } catch( err ) {
            console.log(err);
            res.status(500).send(err)
        }
        
    });

    router.post('/user/update', async (req, res) => {
        log.debug('[/api/user/update] Entering.')
        const userRequest = req.body.user;
        log.trace('[/api/user/update] User Data Requested:' + JSON.stringify(userRequest));
        try {
            log.debug('[/api/user/update] Updating User with id: ' + userRequest.id);
            const user = await User.byId(userRequest.id);
            if(userRequest.email != undefined) { user.email = userRequest.email }
            if(userRequest.password != undefined) { user.password = userRequest.password }
            if(userRequest.role != undefined) { user.role = userRequest.role }
                
            if(user.changed('email') || user.changed('password') || user.changed('role') ) {
                await user.save();
                log.debug('[/api/user/update] Updated!');
            } else {
                log.warn('[/api/user/update] No Changes Detected. Why was this called? Not saving.')
            }
            
            res.status(200);
            res.send("Success");
        } catch(err) {
            console.log(err);
            log.error(JSON.stringify(err))
            res.status(400);
            res.send(err);
        }
    });

    router.get('/user/delete', async (req, res) => {

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
        log.debug('[/api/recipes/add] Enter.')
        const data = req.body.recipe;
        log.trace('[/api/recipes/add] Recipe Data: ' + JSON.stringify(data))
        
        try {
            log.debug('[/api/recipes/add] Building Recipe')
            const recipe = Recipe.build(data);
            log.trace('[/api/recipes/add] Recipe Built. Saving Next: ' + JSON.stringify(recipe))
            await recipe.save();
            log.debug('[/api/recipes/add] Saved RecipeId: ['+recipe.id+']. Now for tags and recipe ingredients')
            if(data.recipeIngredients) {
                for(const ri of data.recipeIngredients) {
                    log.debug('[/api/recipes/add] Creating RecipeIng ['+ri.amount+'] ['+ri.ingredientDescription+']')
                    ri.recipeId = recipe.id;
                    const recipeIngredient = await RecipeIngredient.create(ri);
                    log.trace('[/api/recipes/add] Created Recipe Ingredient with ID: ' + recipeIngredient.id)
                }
            }

            if(data.tags) {
                for(const tag of data.tags) {
                    const recipeTag = await RecipeTag.create({
                        recipeId: recipe.id,
                        tagId: tag
                    });
                    log.trace('[/api/recipes/add] Created RecipeTag with ID: ' + recipeTag.id)
                }
            }

            //const recipe = await Recipe.create( data );

            res.status(200)
            res.send("Success");
        } catch(err) {
            res.status(400);
            res.send(err.errors[0].message);
        }
        
    });
        
    router.post('/recipes/:recipe/update', async (req, res) => {
        log.debug('POST [api/recipes/recipe:/update] Entering: ' + req.params.recipe);
        var recipeId = req.params.recipe;
        log.debug('[api/recipes/'+recipeId+'/update] Grabbing attributes...')
        var attMap = req.body.attributes;
        log.trace('[api/recipes/'+recipeId+'/update] Attributes: ' + JSON.stringify(attMap));
        log.debug('[api/recipes/'+recipeId+'/update] Searching for ' + recipeId);
        recipe = await Recipe.byId(recipeId)
        if(recipe) {
            log.debug('[api/recipes/'+recipeId+'/update] Found ['+recipeId+']. Update attributes.');
            for(var key in attMap){
                if(key == 'recipeIngredients') {
                    continue;
                }
                recipe[key] = attMap[key];
            }
            log.debug('[api/recipes/'+recipeId+'/update] Updating Recipe ['+recipeId+']!')
            try {
                await recipe.save();
                log.debug('[api/recipes/'+recipeId+'/update] Successfully saved Recipe. Checking to see if recipe Ingredients need to be updated.')
                if(attMap['recipeIngredients'] != undefined) {
                    log.debug('[api/recipes/'+recipeId+'/update] Updating Recipe Ingredients as well.')
                    for(const ri of attMap['recipeIngredients']) {
                        log.trace('[api/recipes/'+recipeId+'/update] ' + JSON.stringify(ri));
                        if(ri.id == undefined && (ri.amount != undefined || ri.ingredientDescription != undefined)) {
                            log.trace('[api/recipes/'+recipeId+'/update] Recipe Ingredient request with no id. Inserting new Recipe Ingredient');
                            var newRi = await RecipeIngredient.create({ 
                                amount: ri.amount, 
                                ingredientDescription: ri.ingredientDescription,
                                recipeId: recipeId
                            });
                            log.debug("api/recipes/'+recipeId+'/update] Success. auto-generated ID:" + newRi.id);
                        } else {
                            log.trace('[api/recipes/'+recipeId+'/update] Updating Recipe Ingredient with id: ' + ri.id);
                            await RecipeIngredient.update({ 
                                amount: ri.amount ,
                                ingredientDescription: ri.ingredientDescription
                            }, {
                                where: {
                                    id: ri.id
                                }
                            });
                        }
                    }
                }

                res.status(200).send('[api/recipes/'+recipeId+'/update] Successfully updated '+recipeId);
            } catch(err) {
                log.error(JSON.stringify(err))
                res.status(500).send(err)
            }

            


        } else {
            res.status(404).send('[api/recipes/'+recipeId+'/update] Recipe with id '+recipeId+' not found')
        }
    });

    router.post('/recipes/delete', async (req, res) => {
        log.debug('[/api/recipes/delete] Enter.')
        const recipeId = req.body.id;
        log.trace('[/api/recipes/delete] Recipe Id: ' + recipeId)
        try {
            log.debug('[/api/recipes/delete] Deleting Recipe Object');
            var recipeRows = await Recipe.destroy({
                where: {
                  id: recipeId
                }
            });
            log.debug('[/api/recipes/delete] Recipe Deleted ['+recipeRows+']. Moving on to Ingredients')
            var riRows = await RecipeIngredient.destroy({
                where: {
                  recipeId: recipeId
                }
            });
            log.debug('[/api/recipes/delete] RecipeIngredients Deleted ['+riRows+']. Moving on to Tags')
            var tagRows = await RecipeTag.destroy({
                where: {
                  recipeId: recipeId
                }
            });
            log.debug('[/api/recipes/delete] Tags Deleted ['+tagRows+']. Checking GroceryLists')
            var groceryRows = await GroceryListRecipe.destroy({
                where: {
                  recipeId: recipeId
                }
            });
            log.debug('[/api/recipes/delete] Grocery Rows Deleted ['+groceryRows+']. Checking Favorites')
            var favoriteRows = await Favorite.destroy({
                where: {
                  recipeId: recipeId
                }
            });
            log.debug('[/api/recipes/delete] Favorite Rows Deleted ['+groceryRows+']')
            log.info('[/api/recipes/delete] Successfully Delete Recipe ['+recipeId+'] Rows Deleted: ' + (recipeRows + riRows + tagRows + groceryRows + favoriteRows) )
            res.status(200)
            res.send("Success");
        } catch(err) {
            res.status(400);
            res.send(err.errors[0].message);
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

    router.post('/recipe-ingredient/update', async(req, res) => {
        log.debug('[/api/recipe-ingredient/update] Entering.')
        const riRequest = req.body.recipeIngredient;
        log.trace('[/api/recipe-ingredient/update] Recipe Ingredient Requested:' + JSON.stringify(riRequest));
        try {
            log.debug('[/api/recipe-ingredient/update] Updating Recipe Ingredient with id: ' + riRequest.id);
            const ri = await RecipeIngredient.update({ 
                amount: riRequest.amount, 
                ingredientDescription: riRequest.ingredientDescription, 
                recipeId: riRequest.recipeId, 
                ingredientId: riRequest.ingredientId, 
                isRecipe: riRequest.isRecipe
            }, {
                where: {
                    id: riRequest.id
                }
            });
            log.debug('[/api/recipe-ingredient/update] Updated!');
            
            res.status(200);
            res.send("Success");
        } catch(err) {
            console.log(err);
            log.error(JSON.stringify(err))
            res.status(400);
            res.send(err);
        }
    });

    router.post('/recipe-ingredient/delete', async(req, res) => {
        log.debug('[/api/recipe-ingredient/delete] Entering.')
        const riId = req.body.id;
        log.trace('[/api/recipe-ingredient/delete] Delete Requested for ID:' + riId);
        try {
            log.debug('[/api/recipe-ingredient/delete] Updating Recipe Ingredient with id: ' + riId);
            await RecipeIngredient.destroy({
                where: {
                  id: riId
                }
            });
            log.debug('[/api/recipe-ingredient/delete] Deleted!');
            res.status(200);
            res.send("Success");
        } catch(err) {
            console.log(err);
            log.error(JSON.stringify(err))
            res.status(400);
            res.send(err);
        }
    });


    router.get('/ingredients', async (req, res) => {
        const ingredients = await Ingredient.findAll();
        // Compile the source code
        res.render('helpers/ingredients-table', {
            ingredients: ingredients
        });
    });

    router.get('/ingredients/id', async (req, res) => {
        const results = await Ingredient.findAll({ attributes: ['id']});
        const ids = []
        for(const result of results) {
            ids.push(result.id)
        }
        // Compile the source code
        res.status(200).send(ids)
    });

    router.post('/ingredient/add', async (req, res) => {
        log.debug('[/api/ingredient/add] Entering..');
        var ingRequest = req.body.ingredient
        log.trace('[/api/ingredient/add] Ingredient JSON: ' + JSON.stringify(ingRequest));
        try {
            const ing = await Ingredient.create({ 
                id: ingRequest.id,
                name: ingRequest.name,
                categoryId: ingRequest.categoryId
            })
            res.status(200).send('Successfully Created Ingredient with Id: ' + ing.id)
        } catch( err ) {
            console.log(err);
            res.status(500).send(err)
        }
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

    router.post('/ingredient/delete', async (req, res) => {
        log.debug('[/api/ingredient/delete] Enter');
        const id = req.body.id;
        log.debug('[/api/ingredient/delete] Delete Ingredient with id: ' + id);
        const ingredient = await Ingredient.findByPk(id)
        if(ingredient != undefined) {
            log.trace('[/api/ingredient/delete] Got ingredient: ' + JSON.stringify(ingredient))
            try { 
                await ingredient.destroy();
                log.debug('[/api/ingredient/delete] Successfully Deleted.');
                res.status(200).send('Success');
            } catch(err) {
                console.log(err);
                log.error(JSON.stringify(err));
                res.status(500).send(err);
            }
        } else {
            res.status(404).send('Ingredient with ID: ' + id + ' was not found.')
        }

    });

    router.get('/tags/', async (req, res) => {
        const tags = await Tag.findAll();
        // Compile the source code
        res.render('helpers/tags-table', {
            tags: tags
        });
    });

    router.get('/tags/id', async (req, res) => {
        
        var results = await Tag.findAll({ attributes: ['id']});
        const ids = []
        for(const result of results) {
            ids.push(result.id)
        }
        // Compile the source code
        res.status(200).send(ids)
    });

    router.post('/tag/add', async (req, res) => {
        log.debug('[/api/tag/add] Entering..');
        var tagRequest = req.body.tag
        log.trace('[/api/tag/add] Ingredient JSON: ' + JSON.stringify(tagRequest));
        try {
            const tag = await Tag.create({ 
                id: tagRequest.id,
                name: tagRequest.name,
                category: tagRequest.categoryId
            })
            res.status(200).send('Successfully Created Ingredient with Id: ' + tag.id)
        } catch( err ) {
            console.log(err);
            res.status(500).send(err)
        }
    });

    router.post('/tag/update', async (req, res) => {
        log.debug('[/api/tag/update] Entering.')
        const tagRequest = req.body.tag;
        log.trace('[/api/tag/update] Tag Requested:' + JSON.stringify(tagRequest));
        try {
            log.debug('[/api/tag/update] Updating Tag with id: ' + tagRequest.id);
            const tag = await Tag.update({ name: tagRequest.name, category: tagRequest.category }, {
                where: {
                    id: tagRequest.id
                }
            });
            log.debug('[/api/tag/update] Updated!');
            res.status(200);
            res.send("Success");
        } catch(err) {
            console.log(err);
            log.error(JSON.stringify(err))
            res.status(400);
            res.send(err);
        }
        
    });

    router.get('/recipe-tags/', async (req, res) => {
        log.debug('[/api/recipe-tags/id] Grabbing RecipeTags')
        var r = req.query.r || '';
        
        log.debug('[/api/recipe-tags/id] Filter: r=' + r);
        var results = [];
        if( r == '') {
            results = await RecipeTag.findAll({ attributes: ['tagId']});
        } else {
            results = await RecipeTag.findAll({ where: { recipeId: r }, attributes: ['tagId']});
        }
        const ids = []
        for(const result of results) {
            ids.push(result.tagId)
        }

        var tags = await Tag.findAll({
            where: {
                id: ids
            }
        });
        
        // Compile the source code
        res.status(200).send(tags)
    });

    router.post('/recipe-tag/add', async (req, res) => {
        log.debug('[/api/recipe-tag/add] Enter');
        const recipeId = req.body.recipeId;
        const tags = req.body.tags || [];
        log.debug('[/api/recipe-tag/add] Adding ['+tags.length+'] to ['+recipeId+']');
        try {
            for( const tag of tags) {
                await RecipeTag.create({ 
                    recipeId: recipeId,
                    tagId: tag
                })
                log.debug('[/api/recipe-tag/add] Added ['+tag+'] to ['+recipeId+'].')
            }
            res.status(200).send('Successfully Added ['+tags.length+'] Tags to ['+recipeId+']')
        } catch( err ) {
            console.log(err);
            res.status(500).send(err)
        }

    });

    router.post('/recipe-tag/delete', async (req, res) => {
        log.debug('[/api/recipe-tag/delete] Enter');
        const recipeId = req.body.recipeId;
        const tagId = req.body.tagId;
        log.debug('[/api/recipe-tag/delete] Delete ['+tagId+'] from ['+recipeId+']');
        try {
            log.debug('[/api/recipe-tag/delete] Deleting RecipeTag');
            const { Op } = require("sequelize");
            var rtRows = await RecipeTag.destroy({
                where: {
                    [Op.and]: [
                        { recipeId: recipeId}, 
                        { tagId: tagId}
                    ]
                }
            });
            log.debug('[/api/recipe-tag/delete] Deleted ['+rtRows+'] row(s)!');
            res.status(200);
            res.send("Success");
        } catch(err) {
            console.log(err);
            log.error(JSON.stringify(err))
            res.status(400);
            res.send(err);
        }
        


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

    router.post('/notify/new-recipe/', async (req, res) => {
        log.debug('[/notify/new-recipe/] Entering notify. sending new recipe email!')
        const recipeId = req.body.recipeId;
        log.debug('[/notify/new-recipe/] New Recipe ID: ' + recipeId);

        const { Op, QueryTypes} = require("sequelize");

        newRecipe = await Recipe.findByPk(recipeId);
        
        var top3Recipes = await sequelize.query(`
            SELECT r.*, count(rpv.id) as viewCount FROM recipes r 
            JOIN recipePageVisits rpv on r.id = rpv.recipeId  GROUP BY r.id
            ORDER BY viewCount desc
            LIMIT 3
        `,
        {
        type: QueryTypes.SELECT
        });

        log.debug('[/notify/new-recipe/] Top Recipes')
        for(const r of top3Recipes){
            log.debug('[/notify/new-recipe/] >> ' + r.name)
        }

        var featuredRecipes = await Recipe.findAll({
            where: {
                id: ['cheese-sauce','spicy-coconut-corn-crack','millionaire-squares','daves-jungle-curry']
            }
        });

        log.debug('[/notify/new-recipe/] Featured Recipes')
        for(const r of featuredRecipes){
            log.debug('[/notify/new-recipe/] >> ' + r.name)
        }

        var recentRecipes = await Recipe.findAll({
            where: {
                approved: 1
            },
            limit: 3,
            order: [ [ 'updatedAt', 'DESC' ]]
        });

        log.debug('[/notify/new-recipe/] Recent Recipes');
        var i = 0;
        for(const r of recentRecipes){
            if( i > 0 ) {
                log.debug('[/notify/new-recipe/] >> ' + r.name + ' (not shown)');
            } else {
                log.debug('[/notify/new-recipe/] >> ' + r.name);
            }
        }
        
        var emailTemplate = app.get('views') + '/email-templates/new-recipe.pug'
        log.debug('Email Template File: ' + emailTemplate)
        var html = pug.renderFile(emailTemplate, {
            newRecipe,
            top3Recipes,
            recentRecipes,
            featuredRecipes,
            hostname: 'veganrecipes.ddns.net'
        });
        
        const environment = 'production' //process.env.NODE_ENV || 'development';

        var mailList = [];

        if( environment == 'production') {
            log.debug('[/notify/new-recipe/] Production Enabled! Sending To All Recipients!')
            mailList = [
                'thook07@gmail.com',
                'lalbers07@gmail.com',
                'cakers88@hotmail.com',
                'brandon.m.springer89@gmail.com',
                'brianderrow@gmail.com',
                'amanda.andrew.89@gmail.com',
                'jeannahook@yahoo.com',
                'faith.d.hook@gmail.com',
                'langlolandscaping@gmail.com',
                'Loder.brian@gmail.com',
                'stevenkabbes@gmail.com'
            ]
        } else {
            log.debug('[/notify/new-recipe/] Running In Dev sending only to certain addresses')
            mailList = [
                'thook07@gmail.com'
            ]
        }



        var mailOptions = {
            from: "veganrecipes02@gmail.com", // sender address
            subject: 'New Recipe Added: ' + newRecipe.name, // Subject line
            bcc: mailList,
            html: html
        };



        log.info('Sending Email to ['+mailList.length+'] recepients')
    
        // send mail with defined transport object
        nodemailer.sendMail(mailOptions, function(error, info){
            if( error ){
            log.error('Error Sending Email..');
            log.error("Email Error: " + error);
            } else {
                log.info('Email Message sent: ' + info.response);
            }
        });

        res.send('success')

    })

    return router;
}

