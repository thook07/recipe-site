const express = require('express');
const router = express.Router();
const log = require('../config/logger')
const tags = require('../tags.json');
const framework = require('../framework')
const User = require('../models/User')
const Recipe = require('../models/Recipe')
const RecipeIngredient = require('../models/RecipeIngredient')
const RecipePageVisit = require('../models/RecipePageVisit')
const Ingredient = require('../models/Ingredient')
const IngredientCategory = require('../models/IngredientCategory')
const Tag = require('../models/Tag')
const authZ = require('../config/authorization');

module.exports = function(sequelize){

// -- Administrative Stuff
router.get("/", async (req, res) => {
    log.trace('[/admin] Building Dashboard...');
    //authZ.protected(req,res);
    const { Op, QueryTypes} = require("sequelize");

    var recipeCount = await Recipe.count();
    var riCount = await RecipeIngredient.count();
    var ingredientCount = await Ingredient.count();
    var tagCount = await Tag.count();
    var pendingRecipes = await Recipe.count({ where: {approved: false} })
    var noNameIngredients = await Ingredient.count({ where: {name: { [Op.is]: null}}})
    var recipeIngIssues = await RecipeIngredient.count({ where: {ingredientId: { [Op.is]: null}}})
    var percentNoName = (noNameIngredients / ingredientCount * 100).toFixed(2) + '%'
    var totalViews = await RecipePageVisit.count();
    var totalUsers = await User.count();
    var totalAdmins = await User.count({ where: {role: "Admin"}});


    var top10Recipes = await sequelize.query(`
        SELECT r.*, count(rpv.id) as viewCount FROM recipes r 
        JOIN recipePageVisits rpv on r.id = rpv.recipeId  GROUP BY r.id
        ORDER BY viewCount desc
        LIMIT 10
        `,
        {
          type: QueryTypes.SELECT
        });

    
    var data = {
        recipeCount,
        riCount,
        ingredientCount,
        tagCount,
        pendingRecipes,
        noNameIngredients,
        percentNoName,
        top10Recipes,
        totalViews,
        totalUsers,
        totalAdmins,
        recipeIngIssues
    }

    res.render("admin/admin-dashboard.pug", {
        user: req.user,
        data: data,
        pendingRecipes
    });
});

router.get('/recipes', async (req, res) => {

    var q = req.query.q || '';
    var r = req.query.r || '';
    var issues = req.query.issues || false;

    const { Op } = require("sequelize");
    var recipes = []
    if(q != '' ) {
        recipes = await Recipe.findAll({
            where: {
                [Op.or]: [
                    { id: {[Op.like] : '%'+q+'%' }}, 
                    { name: {[Op.like] : '%'+q+'%' }}, 
                    { attAuthor: {[Op.like] : '%'+q+'%' }}, 
                ]
            },
            include: [RecipeIngredient, Tag]
        })
    } else if(r != '' ) {
        recipes = await Recipe.findAll({ where: {id: r}, include: [RecipeIngredient, Tag] });
    } else if(issues == 'true') {
        recipes = await Recipe.findAll({ where: {name: { [Op.is]: null}},include: [RecipeIngredient, Tag] });
    } else {
        recipes = await Recipe.findAll({ limit: 100, include: [RecipeIngredient, Tag] });
    }
    
    var pendingRecipes = await Recipe.count({ where: {approved: false} })
    res.render("admin/recipes", {
        user: req.user,
        pendingRecipes,
        recipes,
        q
    });
});

router.get('/ingredients', async (req, res) => {

    var q = req.query.q || '';
    var issues = req.query.issues || false;

    const { Op } = require("sequelize");
    var ingredients = []
    if(q != '' ) {
        ingredients = await Ingredient.findAll({
            where: {
                [Op.or]: [
                    { id: {[Op.like] : '%'+q+'%' }}, 
                    { name: {[Op.like] : '%'+q+'%' }}, 
                    { categoryId: {[Op.like] : '%'+q+'%' }}, 
                ]
            }
        })
    } else if(issues == 'true') {
        ingredients = await Ingredient.findAll({ where: {name: { [Op.is]: null}}});
    } else {
        ingredients = await Ingredient.findAll({ limit: 100});
    }
    const categories = await IngredientCategory.findAll();

    var pendingRecipes = await Recipe.count({ where: {approved: false} })
    res.render("admin/ingredients", {
        user: req.user,
        pendingRecipes,
        ingredients,
        categories,
        q
    });
});

router.get('/recipe-ingredients', async (req, res) => {

    var q = req.query.q || '';
    var i = req.query.i || '';
    var r = req.query.r || '';
    var issues = req.query.issues || false;
    var queryDisplay;

    const { Op } = require("sequelize") 
    var ris = [];
    if( q != '') {
        queryDisplay = 'Filter: ' + q
        ris = await RecipeIngredient.findAll({
            where: {
                [Op.or]: [
                    { id: {[Op.like] : '%'+q+'%' }}, 
                    { ingredientDescription: {[Op.like] : '%'+q+'%' }}, 
                    { ingredientId: {[Op.like] : '%'+q+'%' }}, 
                ]
            }
        })
    } else if( i != '') {
        queryDisplay = 'Ingredient: ' + i
        ris = await RecipeIngredient.findAll({
            where: {
                ingredientId: i
            }
        });
    } else if( r != '') {
        queryDisplay = 'Recipe: ' + r
        ris = await RecipeIngredient.findAll({
            where: {
                recipeId: r
            }
        });
    } else if( issues == "true") {
        queryDisplay = 'Showing Recipe Ingredients with Issues'
        ris = await RecipeIngredient.findAll({ where: {ingredientId: { [Op.is]: null}}});
    } else {
        ris = await RecipeIngredient.findAll({ limit: 100 });
    }

    const recipes = await Recipe.findAll({attributes: ['id', 'name']});
    const ingredients = await Ingredient.findAll({attributes: ['id', 'name']});

    
    
    
    var pendingRecipes = await Recipe.count({ where: {approved: false} })
    res.render("admin/recipe-ingredients", {
        user: req.user,
        pendingRecipes,
        ris,
        recipes,
        ingredients,
        queryDisplay,
        q,
        i,
        r
    });
});

router.get('/tags', async (req, res) => {
    var q = req.query.q || '';
    
    const { Op, QueryTypes } = require("sequelize");
    var tags = []
    if(q != '' ) {
        tags = await Tag.findAll({
            where: {
                [Op.or]: [
                    { id: {[Op.like] : '%'+q+'%' }}, 
                    { name: {[Op.like] : '%'+q+'%' }},
                    { category: {[Op.like] : '%'+q+'%' }}
                ]
            }
        })
    } else {
        tags = await Tag.findAll({ limit: 100});
    }
    
    var tagCategories = await sequelize.query(`
        SELECT DISTINCT(category) FROM tags
        `,
        {
          type: QueryTypes.SELECT
    });
    
    console.log(tagCategories)

    var pendingRecipes = await Recipe.count({ where: {approved: false} })
    res.render("admin/tags", {
        user: req.user,
        pendingRecipes,
        tagCategories,
        tags,
        q
    });
});

router.get('/pending-recipes', async (req, res) => {


    var recipes = await Recipe.findAll({ where: {approved: false} })
    res.render("admin/pending-recipes", {
        user: req.user,
        pendingRecipes: recipes.length,
        recipes
    });
});

router.get('/add-recipe', async (req, res) => {
    //authZ.protected(req,res);
    log.trace("building /admin/add-recipe page");
    
    const tags = await Tag.findAll();
    res.render('admin/add-recipe', {
        tags: tags
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

router.get('/update-recipe-ingredients', async (req, res) => {
    authZ.protected(req,res);
    log.trace('[/admin/update-recipe-ingredients] Start.')

    const recipeIngredients = await RecipeIngredient.findAll({
        include: {
            all: true,
            nested: true
        }
    }) 

    res.render("admin/admin-update-recipe-ingredients", {
        recipeIngredients: recipeIngredients,
        user: req.user
    });


    /*framework.getRecipeIngredientIssues({"filter":"all"},function(response, err){ 
        res.render("admin/admin-update-recipe-ingredients", {
            recipeIngredients: response.data.recipeIngredients,
            user: req.user
        });
    });*/
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


    return router;
}
