//web app
const express = require('express');
var Promise = require('promise');
const app = express();
var bodyParser = require('body-parser')

//authentication and sessions
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');

//misc
var firebase = require('./firebase.js');
var log = require('./logger.js');
//const recipes = require('./recipes.json');
const recipe1 = require('./recipe1.json');
const recipe2 = require('./recipe2.json');
const tags = require('./tags.json');
const request = require('request');
var framework = require('./framework.js')

//objects
var Recipe = require('./node-js/Recipe.js');
var RecipeGroup = require('./node-js/RecipeGroup.js');
var GroceryList = require('./node-js/GroceryList.js');
var GroceryListItem = require('./node-js/GroceryListItem.js');
var User = require('./node-js/User.js');
var Ingredient = require('./node-js/Ingredient.js');

let INGREDIENTS_CACHE = {};

app.use(require('morgan')('combined'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/src'))

//initialize passport session
app.use(passport.initialize());
app.use(passport.session());

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    log.trace("[Passport Local] Entering local auth")
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  log.trace("[Passport seralizeUser] Entering serializeUser")
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  log.trace("[Passport deseralizeUser] Entering deserializeUser")
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});



const server = app.listen(3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});


// -- Home Page
app.get('/', (req, res) => {
    log.trace("[/] entering app.get(\'/\'):")
    
    framework.getRecipes(undefined, function(response, error) {
        if(error){
            log.error("[/] Error Occurred:" + error);
            res.send("<h1>Error Occurred: "+error+"</h1>")
            return;
        }
        log.trace("[/] Successfully got recipes. Grabbing Tags now..")
        framework.getTags({}, function(tagResponse, tagError){
            var tags = tagResponse.data.tags;

            categoryMap = {};
            for(i=0; i<tags.length; i++) {
                if( tags[i].category in categoryMap) {
                    //do nothing
                    categoryMap[tags[i].category].push(tags[i]);
                } else {
                    categoryMap[tags[i].category] = [tags[i]];
                }
            }

            console.log(categoryMap)

            res.render('index', {
                recipes: response.data.recipeGroup,
                tags: tags,
                user: null,
                newTags: categoryMap
            });
        });
        
        
        
    });
    
    /*firebase.db.collection("recipes")
        .withConverter(recipeConverter).get().then(function(docs) {
            
            var recipes = [];
            docs.forEach((doc) => {
                recipe = doc.data();
                recipes.push(recipe);
            });
        
        //showing home page..
        console.log("Found " + recipes.length + " recipes")
        firebase.firebase.auth().onAuthStateChanged(function(user) {
            console.log("user", user);
            console.log("Showing home page...");
            res.render('index', {
                recipes: recipes,
                tags: tags,
                user: user
            });
        });
        
        
    }).catch((err) => {
        console.log('Error getting documents', err);
        res.send("<h1>Error Occurred</h1>");
    });*/
    
});

// -- Recipe Page
app.get('/recipe/:recipe', (req, res) => {
    log.trace("loading /recipe/{recipe} page...");
    
    var recipeId = req.params.recipe;
    log.trace("Grabbing Recipe: " + recipeId);
    
    framework.getRecipes([recipeId], function(response, err){
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
        
        
        
    })
    
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


// -- User Settings Page
app.get('/user-settings', (req, res) => {
    res.render('account-profile', {
       tags: tags
    });
    
    
});

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


// -- Administrative Stuff
app.get("/admin", (req, res) => {
    res.render("admin/admin.pug", {});
    
});

app.get('/admin/:action', (req, res) => {
    
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
    
});


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

// -- Session Testing
app.get('/login',
  function(req, res){
    res.render('account-signin.pug');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/profile');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

// Handle 404
app.use(function(req, res) {
    res.status(404);
    res.render('404-simple.pug', {
        tags: tags
    });
});


