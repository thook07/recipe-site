//web app
const express = require('express');
const fileUpload = require('express-fileupload');
var Promise = require('promise');
const app = express();
var bodyParser = require('body-parser')

//authentication and sessions
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

//storage
const db = require('./config/database')
//Test db
db.authenticate()
    .then(() => console.log('Database Connected...'))
    .catch(err => console.log("error: " + err))

//misc
var firebase = require('./firebase.js');
var log = require('./config/logger.js');
//const recipes = require('./recipes.json');
const recipe1 = require('./recipe1.json');
const recipe2 = require('./recipe2.json');
const tags = require('./tags.json');
const request = require('request');
var framework = require('./framework.js')

//objects
var Recipe = require('./models/Recipe.js');
var Tag = require('./models/Tag.js');
var User = require('./models/User')
//var Recipe = require('./node-js/Recipe.js');
var RecipeGroup = require('./node-js/RecipeGroup.js');
var GroceryList = require('./node-js/GroceryList.js');
var GroceryListItem = require('./node-js/GroceryListItem.js');
//var User = require('./node-js/User.js');
var Ingredient = require('./node-js/Ingredient.js');

let INGREDIENTS_CACHE = {};

//app.use(require('morgan')('combined'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/src'))
app.use(express.static(__dirname + '/uploads'));
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 2 * 1024 * 1024 * 1024 //2MB max file(s) size
    },
}));

//initialize passport session
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport, Strategy);

const server = app.listen(3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});


// -- Home Page
app.get('/', async (req, res) => {
    let q = req.query.q || ''

    log.trace("[/] entering app.get(\'/\'):")
    if(req.user) {
      log.trace('[/] User: ' + req.user.email)
      log.trace('[/] User Role: ' + req.user.role)
    } else{
      log.trace("[/] User: Anonyomous")
      log.trace('[/] User Role: undefined')
    }

    const { Op } = require('sequelize')
    const recipes = await Recipe.findAll({
        where: {
            [Op.and]: [
                {  
                    name: {
                        [Op.like]: '%'+q+'%' 
                    }
                },
                { approved: 1 }
            ]
        }
    })
    log.trace("[/] Got recipes. Grabbing Tags now..")
    const tags = await Tag.findAll();
    var categoryMap = {};
    for(i=0; i<tags.length; i++){
        if(tags[i].category in categoryMap) {
            categoryMap[tags[i].category].push(tags[i]);
        } else {
            categoryMap[tags[i].category] = [tags[i]];
        }
    }

    //for now i'll just call the getTags async func and apply that to the recipe obj
    //I imagine there is a better way to just do this on recipe load.
    for(const recipe of recipes) {  
        recipe.tags = await recipe.getTags()
    }

    res.render('index', {
        recipes: recipes,
        tags: tags,
        user: req.user,
        newTags: categoryMap
    });
    
});

app.get('/catalog', async (req, res) => {
    log.trace("[/] entering app.get(\'/\'):")
    var userId = undefined
    var user;
    if(req.user) {
        log.trace('[/] User: ' + req.user.email)
        log.trace('[/] User Role: ' + req.user.role)
        user = req.user;
        userId = user.id
        user.favorites = await user.getFavorites();
    } else{
        log.trace("[/] User: Anonyomous")
        log.trace('[/] User Role: undefined')
    }


    let q = req.query.q || '';

    const { Op } = require('sequelize')
    const recipes = await Recipe.findAll({
        where: {
            [Op.and]: [
                {  
                    name: {
                        [Op.like]: '%'+q+'%' 
                    }
                },
                { approved: true }
            ]
        }
    })
    log.trace("[/] Got recipes. Grabbing Tags now..")
    const tags = await Tag.findAll();
    var categoryMap = {};
    for(i=0; i<tags.length; i++){
        if(tags[i].category in categoryMap) {
            categoryMap[tags[i].category].push(tags[i]);
        } else {
            categoryMap[tags[i].category] = [tags[i]];
        }
    }

    //for now i'll just call the getTags async func and apply that to the recipe obj
    //I imagine there is a better way to just do this on recipe load.
    for(const recipe of recipes) {  
        recipe.tags = await recipe.getTags()
    }


    res.render('index-new', {
        recipes: recipes,
        tags: tags,
        user: user,
        userId: userId,
        newTags: categoryMap
    });
        
});
// -- Recipe Routes
app.use('/recipes', require('./routes/recipes'));

// -- Recipe Page
app.get('/recipe/:recipe', async (req, res) => {
    log.trace("loading /recipe/{recipe} page...");
    
    var recipeId = req.params.recipe;
    log.trace("Grabbing Recipe: " + recipeId);

    const recipe = await Recipe.byId(recipeId);
    recipe.tags = await recipe.getTags();
    recipe.recipeIngredients = await recipe.getRecipeIngredients();
    const nested = await recipe.getNestedRecipes();
    var totalRecipes = [recipe];
    if(nested.length > 0 ) {
        for(const r of nested) {  
            r.tags = await r.getTags()
            r.recipeIngredients = await r.getRecipeIngredients();
            totalRecipes.push(r);
        }
    }

    res.render('grocery-single', {
        recipe: recipe,
        nestedRecipes: totalRecipes, 
        tags: tags
    });

    
    /*framework.getRecipes([recipeId], function(response, err){
        if(err) {
            log.error("No Recipe found for ["+recipeId+"]");
            res.status(404);
            res.render('404-simple.pug');
        }
        var recipe = response.data.recipeGroup[0];
        var nestedRecipes = response.data.nestedRecipes;
        //adding the original recipe to the front of the array
        nestedRecipes = [recipe].concat(nestedRecipes);
        log.debug("Showing Page for recipe: " + recipe.id)
        res.render('grocery-single', {
            recipe: recipe,
            nestedRecipes: nestedRecipes, 
            tags: tags
        });
        
        
        
    })*/
    
    /*let recipeRef = firebase.db.collection('recipes').doc(recipeId);
    let getDoc = recipeRef.get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            res.status(404);
            res.render('404-simple.pug');
        } else {
            console.log("Showing Page for recipe: " + recipeId)
            res.render('grocery-single', {
                recipe: doc.data(),
                tags: tags
            });
        }
    }).catch(err => {
        console.log('Error getting document', err);
        res.status(404)
        res.render('404-simple.pug');
    });*/
    
});


// -- Account Routes
app.use('/account', require('./routes/account'));

// -- Administrative Routes
app.use('/admin', require('./routes/admin'));

// -- API Routes
app.use('/api', require('./routes/api'));

// -- Profile Routes
app.use('/profile', require('./routes/profile'));

// -- My Recipes
app.get('/my-recipes', (req, res) => {
    res.render('dashboard-products', {
       tags: tags
    });
    
    
});

// -- My Favorite Recipes
app.get('/my-favorites', (req, res) => {
    res.render('dashboard-favorites', {
       tags: tags
    });
    
    
});

// -- My Grocery List
app.get('/my-grocery-list', (req, res) => {
    log.trace("[/my-grocery-list] Entering....");
    var userEmail = req.query.email;
    
    log.trace("[/my-grocery-list] Got userEmal ["+userEmail+"] Grabbing GroceryList")
    firebase.db.collection("users").doc(userEmail).withConverter(userConverter).get().then(function(doc) {
        log.trace("[/my-grocery-list] After Firebase call. Got user data.")
        var user = doc.data();
        var recipeIds = [];
        var groceryListMap = user.groceryList
        for (var recipe in groceryListMap) {
            log.trace("[/my-grocery-list] adding recipeId ["+recipe+"]to the list")
            recipeIds.push(recipe);
        }

        log.trace("recipeIds " + recipeIds);
        if( recipeIds.length <= 0 ) {
            log.trace("No recipes in the grocery list!");
            res.render('my-grocery-list', {
                user: null,
                recipes: null,
                list: null,
                map: null
            });
        }


        log.trace("[/my-grocery-list] using framework to get the full recipe Objects.");
        framework.getRecipes(recipeIds, function(response, err){
            
            if(err) {
                log.error("[/my-grocery-list] " + err);
                log.error("[/my-grocery-list] Error occured building grocery list.");
                res.status(404);
                res.render('404-simple.pug');
                return;
            }
            
            log.trace("[/my-grocery-list] Creating RecipeGroup Object...")
            var recipeGroup = new RecipeGroup(response.data.recipeGroup);

            if('nestedRecipes' in response.data) {
                log.trace("[/my-grocery-list] Response had nested recipes. Adding to the recipeGroup")
                for(var i=0; i<response.data.nestedRecipes.length; i++) {
                    log.trace("[/my-grocery-list] Processing nested recipe ["+response.data.nestedRecipes[i].id+"]")
                    recipeGroup.addNestedRecipe(response.data.nestedRecipes[i],response.data.nestedRecipes[i].parentRecipe);
                }
                
            }
            
            //log.trace("Items: "+items.length)
            
            var groceryList = recipeGroup.getGroceryList();
            console.log(groceryListMap);

            log.debug("[/my-grocery-list] Showing Page for my-grocery-list")
            res.render('my-grocery-list', {
                user: user,
                recipes: recipeGroup.recipes,
                list: groceryList,
                map: groceryListMap
            });
            
        
        
        
        })
      
    }).catch(function(e){
        console.log("Error Occured:",e); 
    });
    
});


function buildGroceryItemsList(recipes, user, res){
    log.trace("Entering buildGroceryItemsllList...." + recipes.length);
    
    console.log("Buildilng Cache!");
    firebase.db.collection("ingredients").withConverter(ingredientConverter).get().then(function(documents){
        console.log("Got Documents: " + Object.keys(documents).length);
        documents.forEach(function(doc){
            console.log("Got",doc.id,"adding to cache");
            var ing = doc.data();
            INGREDIENTS_CACHE[ing.id] = ing;
        });

        console.log("Updated Cache Successfully. Cache now has",Object.keys(INGREDIENTS_CACHE).length,"ingredients");
        
        var list = new GroceryList();
        
        for(var i=0; i<recipes.length; i++){
            var recipe = recipes[i]
            for(var j=0; j < recipe.ingredients.length; j++) {
                var id = recipes[i].ingredients[j].ingredientId;
                var amount = recipes[i].ingredients[j].amount;

                if(id == 'header') { continue; }

                list.addItem(id,amount,recipe.id,INGREDIENTS_CACHE[id]);
            }
        }
        
       
        list.populateItemsByCategory();
        
        res.render('my-grocery-list', {
            user: user,
            recipes: recipes,
            list: list
        });
    }).catch(function(e){
       console.log("Error",e); 
    });
    
    
    
}

app.get('/mealplan', (req, res) => {

    var map = {
        "Monday": {
            "M1:": ["Simple Bean Burgers"],
            "M2:": ["Oatmeal Raisin Energy Balls"],
            "M3:": ["Sweet Potato Curry","Brown Rice"],
            "M4:": ["Apple with Almound Butter"],
            "M5:": ["Jalapeno Popper Mac and Cheese"]
        },
        "Tuesday": {
            "M1:": ["recipe1","recipe1"],
            "M2:": ["snack"],
            "M3:": ["recipe1","recipe1"],
            "M4:": ["apple"],
            "M5:": ["recipe1"]
        },
        "Wednesday": {
            "M1:": ["recipe1","recipe1","recipe1"],
            "M2:": ["snack"],
            "M3:": ["recipe1","recipe1"],
            "M4:": ["apple"],
            "M5:": ["recipe1"]
        },
        "Thursday": {
            "M1:": ["recipe1"],
            "M2:": ["snack"],
            "M3:": ["recipe1","recipe1"],
            "M4:": ["apple"],
            "M5:": ["recipe1"]
        },
        "Friday": {
            "M1:": ["recipe1","recipe1","recipe1"],
            "M2:": ["snack"],
            "M3:": ["recipe1","recipe1"],
            "M4:": ["apple"],
            "M5:": ["recipe1"]
        },
        "Saturday": {
            "M1:": ["recipe1","recipe1","recipe1"],
            "M2:": ["snack"],
            "M3:": ["recipe1","recipe1"],
            "M4:": ["apple"],
            "M5:": ["recipe1"]
        },
        "Sunday": {
            "M1:": ["recipe1"],
            "M2:": ["snack"],
            "M3:": ["recipe1"],
            "M4:": ["apple"],
            "M5:": ["recipe1"]
        },
        
        
    }

    res.render("meal-plan", {
        map: map
    });

});


app.post('/validateToken', (req, res) => {
    
    var token = req.body.token
    
    firebase.admin.auth().verifyIdToken(token).then(function(decodedToken) {
        let uid = decodedToken.uid;
        console.log("decoded", uid);
        
    }).catch(function(error) {
        // Handle error
    });
    
    res.send('success');
})



// -- Used for Testing
app.get('/test', (req, res) => {
    log.info("/test requested....")
    
    
    firebase.firebase.auth().onAuthStateChanged(function(user) {
        console.log("user", user);
        console.log("Showing home page...");
        res.render('test');
    });
    
});

// -- Used for Testing
app.get('/test2', (req, res) => {
   log.info("/test2 requested....")
    
   res.render('test2');
});

// -- Model Testing
app.get('/model', async (req, res) => {
    const { Op } = require('sequelize')
    const jack = User.build({ email: "jill@gmail.com" });
    jack.role = 'User';
    jack.password = 'Pa$$w0rd';
    console.log(jack instanceof User); // true
    console.log(jack); 
    await jack.save();
    console.log('Jack was saved to the database!');
    res.send('<h1>'+JSON.stringify(jack)+'</h1>')
});



// -- Session Testing
app.get('/login',
  function(req, res){
    log.trace("GET [/login] Entering login. Showing login page")
    res.render('account-signin.pug');
  });
  
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/catalog');
  });



app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  
});

// - End Session Testing

// Handle 404
app.use(function(req, res) {
    res.status(404);
    res.render('404-simple.pug', {
        tags: tags
    });
});


