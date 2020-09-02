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
//models
const User = require('./models/User')
const Recipe = require('./models/Recipe')
const RecipeIngredient = require('./models/RecipeIngredient')
const Favorite = require('./models/Favorite')
const GroceryListRecipe = require('./models/GroceryListRecipe')
const Tag = require('./models/Tag')
const RecipePageVisit = require('./models/RecipePageVisit');
const Ingredient = require('./models/Ingredient');
const IngredientCategory = require('./models/IngredientCategory');
const relations = require('./config/relations');

//misc
var firebase = require('./firebase.js');
var log = require('./config/logger.js');
//const recipes = require('./recipes.json');
const recipe1 = require('./recipe1.json');
const recipe2 = require('./recipe2.json');
const tags = require('./tags.json');
const request = require('request');
var framework = require('./framework.js')

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
    res.redirect('/catalog');
});

// -- Catalog
app.get('/catalog', async (req, res) => {
    log.trace("[/] entering app.get(\'/\'):")
    var userId = undefined
    var user = req.user //|| await User.byId(1);
    if(user) {
        //log.trace('[/] User: ' + req.user.email)
        //log.trace('[/] User Role: ' + req.user.role)
        userId = user.id
        var favoriteArr = [];
        for(const favorite of user.favorites) {
            favoriteArr.push(favorite.recipeId);
        }
        user.favorites = favoriteArr;
        user.groceryList = await user.getGroceryList();
        //user.groceryListItems = await user.getGroceryListRecipes();
        log.trace('[/catalog] UserId: ' + user.id);
    } else{
        log.trace("[/] User: Anonyomous")
        log.trace('[/] User Role: undefined')
    }

    let q = req.query.q || '';
    var qTags = req.query.tags;
    var sortBy = req.query.sort || 'az'

    if(sortBy == 'favorite' && user == undefined) {
        log.warn('Trying to sort on favorite without being logged in. Switching to AZ');
        sortBy = 'az';
    }

    qTags = (qTags == undefined) ? [] : qTags.split(',');
    log.trace("Tags: "+JSON.stringify(qTags));
    console.log(qTags);
    const { Op } = require('sequelize')
    var recipes = await Recipe.findAll({
        where: {
            [Op.or]: {
                name: {
                    [Op.like]: '%'+q+'%'
                },
                attAuthor: {
                    [Op.like]: '%'+q+'%'
                },
            },
            approved: 1
        },
        include: [Tag]
    })
    log.trace('[/catalog] Got recipes based on query. Now need to check to see if any other filters are applied');
    log.debug('[/catalog] Current Recipe Total: ['+recipes.length+']');

    if(sortBy == 'popular') {
        log.trace('[/catalog] SortBy was popular. So need to grab view count to be able to sort.');
        var tempArr = recipes.slice();
        recipes = [];
        for(const recipe of tempArr) {
            recipe.views = await recipe.viewCount
            log.trace('recipe views' + recipe.views)
            recipes.push(recipe);
        }
        
    }


    var filterEnabled = false;
    var filteredRecipes = [];
    if( qTags.length > 0 ){
        filterEnabled = true
        log.debug('[/catalog] Tag Filter Applied: ' + JSON.stringify(qTags))
        for(const recipe of recipes){
            for(const tag of recipe.tags){
                if(qTags.includes(tag.id) == false) {
                    filteredRecipes.push(recipe);
                    break;
                }
            }
        }

    }






    if(filterEnabled) { log.debug('[/catalog] Current Recipe Total: ['+filteredRecipes.length+']');}
    var finalRecipes = (filterEnabled ? filteredRecipes : recipes);



    log.trace("[/catalog] Building Sidebar full of tags...");
    const tags = await Tag.findAll();
    var categoryMap = {};
    for(i=0; i<tags.length; i++){
        if(tags[i].category in categoryMap) {
            categoryMap[tags[i].category].push(tags[i]);
        } else {
            categoryMap[tags[i].category] = [tags[i]];
        }
    }

    log.debug('[/catalog] Sorting: ' + sortBy);
    

    finalRecipes.sort((a,b) => {
        const name1 = a.name.toUpperCase();
        const name2 = b.name.toUpperCase();
        let comparison = 0;
            
        if(sortBy == 'az' || sortBy == 'za') {
            if (name1 > name2) {
                comparison = 1;
            } else if (name1 < name2) {
                comparison = -1;
            }
            if(sortBy == 'za') {
                return comparison * -1
            }
            return comparison
        } 

        if(sortBy == 'popular') {
            const views1 =  a.views;
            const views2 =  b.views;
            log.trace('[/catalog sort] ' + a.name + '\'s view count was ' + views1 + ', while ' + b.name + '\'s view count was ' + views2 + ' ['+(views1-views2)+']')
            return views2-views1;
        }

        if(sortBy == 'favorite') {
            var isFavorite1 = user.favorites.includes(a.id); //true
            var isFavorite2 = user.favorites.includes(b.id); //false
            if( isFavorite1 == true && isFavorite2 == false) {
                return -1
            }
            if( isFavorite1 == false && isFavorite2 == true) {
                return 1
            }
            return 0;

        }
        log.wtf('[/catalog sort] Shouldnt have gotten here...')
        return 1;
    });
    log.trace('[/catalog] Showing Catalog Page ['+recipes.length+']');

    res.render('index-new', {
        sortBy: sortBy,
        recipes: finalRecipes,
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

    var userId = (req.user == undefined ? 0: req.user.id)
    const rpv = RecipePageVisit.build({
        recipeId: recipe.id,
        userId: userId
    })
    log.trace('Recording Page Visit for Recipe: ['+recipe.id+']')
    await rpv.save();



    res.render('grocery-single', {
        recipe: recipe,
        nestedRecipes: totalRecipes, 
        tags: tags,
        user: req.user
    });
    
});

// -- Account Routes
app.use('/account', require('./routes/account'));

// -- Administrative Routes
app.use('/admin', require('./routes/admin')(db));

// -- API Routes
app.use('/api', require('./routes/api'));

// -- Profile Routes
app.use('/profile', require('./routes/profile'));


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
app.get('/test', async (req, res) => {
    log.info("/test requested....")
    
    const recipe = await Recipe.findOne({
        where: {
          id: "gravy"
        },
        include: Tag
    });
    res.send(JSON.stringify(recipe));


    
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
    res.redirect('/login');
  
});

// - End Session Testing

// Handle 404
app.use(function(req, res) {
    res.status(404);
    res.render('404-simple.pug', {
        tags: tags
    });
});


async function test(){
    const user = await User.findOne({
        where: {
            id: 1
        }
    })
    const list = await user.getGroceryList();
    
    
}

//test();