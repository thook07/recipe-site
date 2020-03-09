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
require('./node-js/Recipe.js');
require('./node-js/User.js');


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
    
    
    firebase.db.collection("recipes")
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
    });
    
});

// -- Recipe Page
app.get('/recipe/:recipe', (req, res) => {
    console.log("loading /recipe/{recipe} page...");
    
    var recipeVar = req.params.recipe;
    console.log("Starting Search. Grabbing Recipe: " + recipeVar);
    
    let recipeRef = firebase.db.collection('recipes').doc(recipeVar);
    let getDoc = recipeRef.get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
            res.status(404);
            res.render('404-simple.pug');
        } else {
            console.log("Showing Page for recipe: " + recipeVar)
            res.render('grocery-single', {
                recipe: doc.data(),
                tags: tags
            });
        }
    }).catch(err => {
        console.log('Error getting document', err);
        res.status(404)
        res.render('404-simple.pug');
    });
    
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
    
    console.log('user',userEmail);
    
    firebase.db.collection("users").doc(userEmail).withConverter(userConverter).get().then(function(doc) {
        var user = doc.data();
        console.log("user",user);
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
            var map = buildIngredientsListMap(recipes);
            
            res.render('my-grocery-list', {
                user: user,
                recipes: recipes,
                ingredientsMap: map
            });
            
        });
        
        
        
    }).catch(function(e){
        console.log("Error Occured:",e); 
    });
});


function buildIngredientsListMap(recipes){
    log.trace("Entering buildIngredientsListMap....",recipes.length);
    var map = {}
    
    for(var i=0; i<recipes.length; i++){
        var recipe = recipes[i]
        log.trace("Recipe......",recipe.name)
        log.trace(recipe.ingredients.length)
        for(var j=0; j<recipe.ingredients.length; j++) {
            var id = recipes[i].ingredients[j].ingredientId;
            var amount = recipes[i].ingredients[j].amount;
            
            if(id == 'header') { continue; }
            
            log.trace("Ingredient.....", id, amount);
            if(map[id] != undefined) {
                map[id] = map[id] + " " + amount
            } else {
                map[id] = amount
            }
        }
    }

    console.log("MAP: ", map);
    return map;
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
app.get('/update', (req, res) => {
    
    if(req.query.id == undefined) {
    
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
        return
    }
    
    let ref = firebase.db.collection('recipes').doc(req.query.id);
    ref.get().then(function(doc){
        let data = doc.data();
        
        res.render('update-recipe', {
            data: data
        });
        
    }).catch( function(error) {
        
    });
    



   
    
    
});


// -- Used for Testing
app.get('/test', (req, res) => {
    log.info("/test requested....")
    
    
    firebase.firebase.auth().onAuthStateChanged(function(user) {
        console.log("user", user);
        console.log("Showing home page...");
        res.render('test');
    });

    

    /*log.trace("getting docRef for users");
    let docRef = firebase.db.collection('users').doc('alovelace');

    log.trace("writing data for Ada");
    let setAda = docRef.set({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815
    });
    log.trace("done writing data!");*/
    
});

// Handle 404
app.use(function(req, res) {
    res.status(404);
    res.render('404-simple.pug', {
        tags: tags
    });
});


