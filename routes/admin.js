const express = require('express');
const router = express.Router();
const log = require('../config/logger')
const tags = require('../tags.json');
const framework = require('../framework')
const Recipe = require('../models/Recipe')
const authZ = require('../config/authorization');

// -- Administrative Stuff
router.get("/", (req, res) => {
    authZ.protected(req,res);
    res.render("admin/admin.pug", {
        user: req.user
    });
});

router.get('/add', (req, res) => {
    authZ.protected(req,res);
    res.send('ADD')
});

router.get('/add-recipe', (req, res) => {
    authZ.protected(req,res);
    log.trace("building /admin/add-recipe page")
    var meals = tags[1];
    var cats = tags[2];
    var cooks = tags[4];

    res.render('admin/admin-add-recipe', {
        tags: tags,
        meals: meals,
        cats: cats,
        cooks: cooks
    });
});

router.get('/add-recipe-images', async (req, res) => {
    authZ.protected(req,res);
    log.trace("[/admin/add-recipe-images] building add recipe images page")
    
    const recipes = await Recipe.getAllAttributes(['id','name', 'images']);

    console.log(recipes[3].images)

    res.render("admin/admin-upload-images", {
        recipes: recipes,
        user: req.user
    });
});

router.get('/update-recipe', (req, res) => {
    authZ.protected(req,res);
    log.trace('[/admin/update-recipe] Start.')
    framework.getRecipesTable({},function(response, err){ 
        if(err){
            res.status(500).send({err})
        }

        var recipes = response.data.recipes;

        res.render("admin/admin-update-recipes", {
            recipes: recipes,
            user: req.user
        })
        
    });
});

router.get('/update-recipe-ingredients', (req, res) => {
    authZ.protected(req,res);
    log.trace('[/admin/update-recipe-ingredients] Start.')
    framework.getRecipeIngredientIssues({"filter":"all"},function(response, err){ 
        res.render("admin/admin-update-recipe-ingredients", {
            recipeIngredients: response.data.recipeIngredients,
            user: req.user
        });
    });
});

router.get('/update-tags', (req, res) => {
    authZ.protected(req,res);
    log.trace('[/admin/update-tags] Start.')
    framework.getRecipes(undefined,function(response, err){ 
        if(err){
            res.status(500).send({err})
        }
    
        framework.getTagTable({}, function(tagResponse, e){
            if(e){
                res.status(500).send({e})
            }
    
            var recipes = response.data.recipeGroup;
            var tags = tagResponse.data.tags;
            var tagMap = {} //break the tags into 4 columns
            var tagsPerColumn = Math.round(tags.length / 4);
            var tags1 = [];
            var tags2 = [];
            var tags3 = [];
            var tags4 = [];
    
            console.log('tpc', tagsPerColumn, "taglength", tags.length);
            for(i=0; i<tagsPerColumn; i++){
                tags1.push(tags[i]);
                tags2.push(tags[i+tagsPerColumn])
                tags3.push(tags[i+(tagsPerColumn*2)])
                console.log("i + tagsPerColumn x 3 =",i+(tagsPerColumn*3))
                if(i+(tagsPerColumn*3) < tags.length) {
                    tags4.push(tags[i+(tagsPerColumn*3)])
                }
            }
            tagMap[1] = tags1
            tagMap[2] = tags2
            tagMap[3] = tags3
            tagMap[4] = tags4
            
            console.log(tagMap);
    
            res.render("admin/admin-update-tags", {
                recipes: recipes,
                tags: tagMap,
                user: req.user
            })
    
        })
    
        
        
    });
});

router.get('/update-ingredients', (req, res) => {
    authZ.protected(req,res);
    res.render("admin/admin-ingredients", {
        user: req.user
    });
});




/*
router.get('/admin/:action', (req, res) => {
    
    var action = req.params.action;
    log.trace("/admin request with action ["+action+"]");


    switch(action) {
        case "createRecipe":
            log.trace("building /admin/createRecipe page")
            var meals = tags[1];
            var cats = tags[2];
            var cooks = tags[4];

            res.render('admin/admin-create-recipe', {
                tags: tags,
                meals: meals,
                 cats: cats,
                 cooks: cooks
             });

          break;
        case "updateRecipes":

            framework.getRecipesTable({},function(response, err){ 
                if(err){
                    res.status(500).send({err})
                }

                var recipes = response.data.recipes;

                res.render("admin/admin-update-recipes", {
                    recipes: recipes
                })
                
            });
        
            return;
        break;
        case "updateRecipeIngredients":
            framework.getRecipeIngredientIssues({"filter":"all"},function(response, err){ 
                res.render("admin/admin-update-recipe-ingredients", {
                    recipeIngredients: response.data.recipeIngredients
                });
            });
            return;
        
        break;
        case "updateRecipeIngredientsIssues":
            framework.getRecipeIngredientIssues({},function(response, err){ 
                res.render("admin/admin-update-recipe-ingredients", {
                    recipeIngredients: response.data.recipeIngredients
                });
            });
            return;
        break;
        case "updateTags":
            framework.getRecipes(undefined,function(response, err){ 
                if(err){
                    res.status(500).send({err})
                }

                framework.getTagTable({}, function(tagResponse, e){
                    if(e){
                        res.status(500).send({e})
                    }

                    var recipes = response.data.recipeGroup;
                    var tags = tagResponse.data.tags;
                    var tagMap = {} //break the tags into 4 columns
                    var tagsPerColumn = Math.round(tags.length / 4);
                    var tags1 = [];
                    var tags2 = [];
                    var tags3 = [];
                    var tags4 = [];

                    console.log('tpc', tagsPerColumn, "taglength", tags.length);
                    for(i=0; i<tagsPerColumn; i++){
                        tags1.push(tags[i]);
                        tags2.push(tags[i+tagsPerColumn])
                        tags3.push(tags[i+(tagsPerColumn*2)])
                        console.log("i + tagsPerColumn x 3 =",i+(tagsPerColumn*3))
                        if(i+(tagsPerColumn*3) < tags.length) {
                            tags4.push(tags[i+(tagsPerColumn*3)])
                        }
                    }
                    tagMap[1] = tags1
                    tagMap[2] = tags2
                    tagMap[3] = tags3
                    tagMap[4] = tags4
                    
                    console.log(tagMap);

                    res.render("admin/admin-update-tags", {
                        recipes: recipes,
                        tags: tagMap
                    })

                })

                
                
            });
        break;

        default:
            res.status(404);
            res.render('404-simple.pug', {
                tags: tags
            });
            return;
    
    
        
    }
    //res.send("<h1>test</h1>");    
    
});*/


module.exports = router;

