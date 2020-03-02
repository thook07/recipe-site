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
    
    firebase.db.collection('recipes').get().then((snapshot) => {
        
        console.log("Starting Search");
        var recipes = [];
        snapshot.forEach((doc) => {
            console.log(doc.id, '=>', doc.data());
            recipes.push(doc.data());
        });
        console.log("Finsihed looping");
        
        //showing home page..
        console.log("Showing home page...");
        res.render('index', {
            recipes: recipes,
            tags: tags
        });
        
        
    }).catch((err) => {
        console.log('Error getting documents', err);
    });
    
});


app.get('/recipe/:recipe', (req, res) => {
    console.log("loading /recipe/{recipe} page...");
    
    var recipeVar = req.params.recipe;
    console.log("Starting Search. Grabbing Recipe: " + recipeVar);
    
    let cityRef = firebase.db.collection('recipes').doc(recipeVar);
    let getDoc = cityRef.get().then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
        } else {
            console.log('Document data:', doc.data());
            //showing home page..
            res.render('grocery-single', {
                recipe: doc.data(),
                tags: tags
            });
        }
    }).catch(err => {
        console.log('Error getting document', err);
    });


    
    
    
    /*firebase.db.collection('recipes').get().then((snapshot) => {
        
        var recipe;
        snapshot.forEach((doc) => {
            recipe = doc.data()
        });
        console.log("Finished looping");
        
        //showing home page..
        console.log("rendering grocery-single page..");
        console.log(recipe);
        res.render('grocery-single', {
            recipe: recipe,
            tags: tags
        });
        
    }).catch((err) => {
        console.log('Error getting documents', err);
    });*/

});


app.get('/grocery-single', (req, res) => {
    res.render('grocery-single', {
        recipe: recipe2,
        tags: tags
    })
});

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
    res.status(403);
    res.render('404-simple.pug');
});


