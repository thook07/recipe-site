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
    router.get("/", authZ.ensureAdmin(), async (req, res) => {
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

    router.get('/users', authZ.ensureAdmin(), async (req, res) => {

        var q = req.query.q || '';
        var role = req.query.role || '';
        var showAll = req.query.showAll || false;

        const { Op } = require("sequelize");
        var users = []
        if(q != '' ) {
            users = await User.findAll({
                where: {
                    [Op.or]: [
                        { id: {[Op.like] : '%'+q+'%' }}, 
                        { email: {[Op.like] : '%'+q+'%' }}, 
                        { role: {[Op.like] : '%'+q+'%' }}, 
                    ]
                }
            })
        } else if(role != '' ) {
            users = await User.findAll({ where: {role: role}});
        } else if(showAll == true ) {
            users = await User.findAll();
        } else {
            users = await User.findAll({ limit: 100 });
        }
        
        var pendingRecipes = await Recipe.count({ where: {approved: false} })
        res.render("admin/users", {
            user: req.user,
            pendingRecipes,
            users,
            q
        });
    });

    router.get('/recipes', authZ.ensureAdmin(), async (req, res) => {

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

    router.get('/ingredients', authZ.ensureAdmin(), async (req, res) => {

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

    router.get('/recipe-ingredients'/*, authZ.ensureAdmin()*/, async (req, res) => {

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

    router.get('/tags', authZ.ensureAdmin(), async (req, res) => {
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

    router.get('/recipe-views', authZ.ensureAdmin(), async (req, res) => {
        
        const pageViews = await RecipePageVisit.findAll({limit: 100, order: [ ['createdAt', 'DESC']] })
        var pendingRecipes = await Recipe.count({ where: {approved: false} })
        res.render("admin/recipe-views", {
            user: req.user,
            pendingRecipes,
            pageViews
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

    router.get('/add-recipe', authZ.ensureAdmin(), async (req, res) => {
        //authZ.protected(req,res);
        log.trace("building /admin/add-recipe page");
        
        const tags = await Tag.findAll();
        var pendingRecipes = await Recipe.count({ where: {approved: false} })
        res.render('admin/add-recipe', {
            user: req.user,
            tags: tags,
            pendingRecipes
        });
    });

    router.get('/upload-recipe-images', authZ.ensureAdmin(), async (req, res) => {
        //authZ.protected(req,res);
        log.trace("[/admin/upload-recipe-images] building add recipe images page")
        
        const recipes = await Recipe.getAllAttributes(['id','name', 'images']);

        console.log(recipes[3].images)
        var pendingRecipes = await Recipe.count({ where: {approved: false} })
        res.render("admin/upload-recipe-images", {
            recipes: recipes,
            user: req.user,
            pendingRecipes
        });
    });

    router.get('/add-user', authZ.ensureAdmin(), async (req, res) => {
        
        var pendingRecipes = await Recipe.count({ where: {approved: false} })
        res.render('admin/add-user', {
            user: req.user,
            pendingRecipes
        });
    });

    router.get('/add-ingredient', authZ.ensureAdmin(), async (req, res) => {
        
        var pendingRecipes = await Recipe.count({ where: {approved: false} })
        var categories = await IngredientCategory.findAll();
        res.render('admin/add-ingredient', {
            user: req.user,
            pendingRecipes,
            categories
        });
    });

    router.get('/add-tag', authZ.ensureAdmin(), async (req, res) => {
        const { Op, QueryTypes } = require("sequelize");
        var categories = await sequelize.query(`
            SELECT DISTINCT(category) FROM tags
            `,
            {
            type: QueryTypes.SELECT
        });

        console.log(categories)

        var pendingRecipes = await Recipe.count({ where: {approved: false} })
        res.render('admin/add-tag', {
            user: req.user,
            pendingRecipes,
            categories
        });
    });

    







    return router;
}
