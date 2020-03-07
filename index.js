const express = require('express');
const app = express();
var firebase = require('./firebase.js');
var log = require('./logger.js');
//const recipes = require('./recipes.json');
const recipe1 = require('./recipe1.json');
const recipe2 = require('./recipe2.json');
const tags = require('./tags.json');


app.set('view engine', 'pug');
app.use(express.static(__dirname + '/src'))


const server = app.listen(3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});


// -- Home Page
app.get('/', (req, res) => {
    log.trace("entering app.get(\'/\'):")
    
    
    firebase.db.collection('recipes').get().then((snapshot) => {
        
        var recipes = [];
        snapshot.forEach((doc) => {
            recipes.push(doc.data());
        });
        
        //showing home page..
        console.log("Found " + recipes.length + " recipes")
        firebase.firebase.auth().onAuthStateChanged(function(user) {
            console.log(user);
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
    
    /*log.trace("getting docRef for users");
    let docRef = firebase.db.collection('users').doc('alovelace');

    log.trace("writing data for Ada");
    let setAda = docRef.set({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815
    });
    log.trace("done writing data!");*/
    
    
    res.send("<h1>Done.</h1>")
});

// Handle 404
app.use(function(req, res) {
    res.status(404);
    res.render('404-simple.pug', {
        tags: tags
    });
});


