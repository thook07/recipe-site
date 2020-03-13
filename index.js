const express = require('express');
var Promise = require('promise');
const app = express();
var bodyParser = require('body-parser')
var firebase = require('./firebase.js');
var log = require('./logger.js');
//const recipes = require('./recipes.json');
const recipe1 = require('./recipe1.json');
const recipe2 = require('./recipe2.json');
const tags = require('./tags.json');
var Recipe = require('./node-js/Recipe.js');
var RecipeGroup = require('./node-js/RecipeGroup.js');
var GroceryList = require('./node-js/GroceryList.js');
var GroceryListItem = require('./node-js/GroceryListItem.js');
var User = require('./node-js/User.js');
var Ingredient = require('./node-js/Ingredient.js');
const request = require('request');
var framework = require('./framework.js')
let INGREDIENTS_CACHE = {};

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/src'))

const server = app.listen(3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});


// -- Home Page
app.get('/', (req, res) => {
    log.trace("entering app.get(\'/\'):")
    
    framework.getRecipes(undefined, function(response, error) {
        if(error){
            log.error("Error Occurred:" + error);
            res.send("<h1>Error Occurred: "+error+"</h1>")
            return;
        }
        
        res.render('index', {
            recipes: response.data.recipeGroup,
            tags: tags,
            user: null
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
    
    var userEmail = req.query.email;
    
    firebase.db.collection("users").doc(userEmail).withConverter(userConverter).get().then(function(doc) {
        var user = doc.data();
        var recipeIds = []
        for(i=0;i<user.groceryList.length;i++){
            console.log("Adding: ", user.groceryList[i], " to the list");
            recipeIds.push(user.groceryList[i]);
        }
        log.trace("recipeIds " + recipeIds);
        framework.getRecipes(recipeIds, function(response, err){
            
            if(err) {
                log.error(err);
                log.error("Error occured building grocery list.");
                res.status(404);
                res.render('404-simple.pug');
                return;
            }
            
            var recipeGroup = new RecipeGroup(response.data.recipeGroup);
            log.debug("Showing Page for my-grocery-list")
            //log.trace("Items: "+items.length)
            log.trace("Recipes: "+recipeGroup.recipes)
            
            var groceryList = recipeGroup.getGroceryList();
            
            res.render('my-grocery-list', {
                user: user,
                recipes: recipeGroup.recipes,
                list: groceryList
            });
            
        
        
        
        })
      
    }).catch(function(e){
        console.log("Error Occured:",e); 
    });
    
    /*
    firebase.db.collection("users").doc(userEmail).withConverter(userConverter).get().then(function(doc) {
        var user = doc.data();
        var promises = []
        for(i=0;i<user.groceryList.length;i++){
            console.log("Adding: ", user.groceryList[i], " to the list");
            const p = firebase.db.collection("recipes").doc(user.groceryList[i]).withConverter(recipeConverter).get();
            promises.push(p);
        }
        Promise.all(promises).then(function(snapshots){
            var recipes = []
            snapshots.forEach(function(doc){
                var recipe = doc.data();
                console.log('recipe: ', recipe.name)
                recipes.push(recipe);
            });
            console.log(recipes.length);
            var list = buildGroceryItemsList(recipes, user, res);
            
        });
        
        
        
    }).catch(function(e){
        console.log("Error Occured:",e); 
    });*/
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

var meals = tags[1];
var cats = tags[2];
var cooks = tags[4];

// -- Add New Recipe
app.get('/add', (req, res) => {
    res.render('add-recipe', {
       tags: tags,
       meals: meals,
        cats: cats,
        cooks: cooks
    });
    
    
});

// -- Update Recipe
app.get('/update/:action', (req, res) => {
    
    
    console.log("REQ: ", req.params);
    if(req.params.action == "ingredients") {
        
        firebase.db.collection('ingredients').withConverter(ingredientConverter).get().then(function(documents){
            
            var ingredients = [];
            documents.forEach(function(snapshot){
                var ingredient = snapshot.data(); 
                ingredients.push(ingredient);
            });
            
            res.render('all-ingredients-2', {
                ingredients: ingredients
            });
        
            
            
            
        })
        
    }else if(req.query.id == undefined) {
    
        let ref = firebase.db.collection('recipes');
        ref.get().then(function(doc) {
            //got the list of recipes
            var documents = doc.docs;
            for(var i=0; i< documents.length; i++) {
                var data = documents[i].data();
                //console.log('data', data)
                var count = 0;
                for(var key in data['ingredients']){
                    count = count + 1;
                }
                console.log(documents[i].id,' has ',count,' ingredients');
                //for(var name in data){
                //    console.log(name,data[name]);
                //}
            }
            
            
            res.render('all-ingredients', {
                docs: documents
            });

            /*var ref = firebase.rDB.ref("ingredientIds");

            ref.on("value", function(snapshot) {
                console.log('ingredientIds', snapshot.val());

                res.render('all-ingredients', {
                    docs: documents
                });

            }, function (errorObject) {
                console.log("Couldn't find ingredientIds");
            });*/
            
            
            

        }).catch(err => {
            console.log('Error getting document', err);
        });
        return;
    } else {
        
        if( req.query.id != undefined) {
            let ref = firebase.db.collection('recipes').doc(req.query.id);
            ref.get().then(function(doc){
                let data = doc.data();

                res.render('update-recipe', {
                    data: data
                });

            }).catch( function(error) {

            });
        }
        
        

        
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




// Handle 404
app.use(function(req, res) {
    res.status(404);
    res.render('404-simple.pug', {
        tags: tags
    });
});


