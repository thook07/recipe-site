

const ALL_RECIPES = {};
var recipesLoaded = false;
var recipes = [];   
let loggedInUser = null;
var email = null;
$(document).ready(function(){

    framework.post("http://3.14.147.18:1338/getRecipes", {}, function(res, err){
        if(err) {
            console.log("Error:",err)
        }
        for(var i=0; i<res.recipeGroup.length; i++){
            var recipe = res.recipeGroup[i];
            ALL_RECIPES[recipe.id] = recipe;
        }
        recipesLoaded = true;
        
    });

    
    //sign in button
    $("#recipe-signin-button").click(function(){
        console.log("Signin button clicked!");


    });
    
    //sign up tab submit
    $("#signup-tab").on("submit", function(e){
        e.preventDefault()
        if ($('#signup-tab')[0].checkValidity() === false) {
            e.stopPropagation();
            return;
        } 
        
        var name = $('#su-name').val();
        var email = $('#su-email').val();
        var password = $('#su-password').val();
        
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function(result) {
            console.log("Successfully created user: ", email)
            //successfully created user. now lets update.
            
            var data = {}
            data["email"] = email;
            data["groceryList"] = [];
            console.log("adding data to user", data);
            var tempUser = new User(data);
            console.log("created new user. Saving...", tempUser);
            tempUser.save(function(){
                console.log("Done!");
            });
            
            
            
            $("#signin-modal").modal('hide');
            $('#sign-in-toast').toast('show');
            $("#si-password").removeClass("is-invalid");        
            updateNavbar();
            $("#signin-modal").modal('hide');
            
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
            $("#signup-tab-passworderror").text(errorMessage);
            $("#signup-tab").removeClass('was-validated');
            $("#su-password").addClass("is-invalid")
        });
        
        


    });
    
    //sign in tab submit
    $("#signin-tab").on("submit", function(e){
        console.log("Signing in...", $('#signin-tab')[0].checkValidity());
        e.preventDefault()
            
        if ($('#signin-tab')[0].checkValidity() === false) {
            e.stopPropagation();
            return;
        } 
        
        console.log("Submit!!");
        var email = $('#si-email').val();
        var password = $('#si-password').val();
        
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
            updateNavbar();
            $("#signin-modal").modal('hide');
            $('#sign-in-toast').toast('show');
            $("#si-password").removeClass("is-invalid")
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(error);
            console.log("Message: ", errorMessage);
            $("#signin-tab-passworderror").text(errorMessage);
            $("#signin-tab").removeClass('was-validated');
            $("#si-password").addClass("is-invalid")
        });
        
    });
    
    //sign out (from dropdown)
    $('#sign-out-button').click(function () {
        console.log("Signing Out..");
        firebase.auth().signOut().then(function() {
            $('#toast-title').text('Success');
            $('#toast-body').text('Sign out successful.');
            $('#generic-success-toast').toast('show');
            loggedInUser = null;
            updateNavbar();
        }).catch(function(error) {
            // An error happened.
            console.log("An Error has occured", error);
            updateNavbar();
        });
    });
    
    /*$("#wishlist-button").click(function() {
        // - wishlist heart clicked.
        var user = firebase.auth().currentUser;
        console.log("User: ", user);
        console.log("toating..");
        
        $grid.isotope({ filter: '.metal' });
        
    });*/
    
    $('#grocery-list-show-button').click(function(){
        
        // similar behavior as clicking on a link
        window.location.href = "/my-grocery-list?email=" + loggedInUser.email;       
    });

    
    $(".grocery-item-add-btn").on('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        
        if( !isUserLoggedIn() ) {
            $("#navbar-sign-in").click();
            return;
        }
        
        
        
        recipeId = $(this).attr("recipe-id");
        console.log("Adding recipe to list", recipeId);
        
        if(loggedInUser.addItemToGroceryList(recipeId) != null){
            loggedInUser.save(function(){
                updateNavbar();
                $('#toast-title').text('Success');
                $('#toast-body').text('Recipe has been added to Grocery List!');
                $('#generic-success-toast').toast('show');
            });
        }
        
    });
    
    $('#grocery-list-container').on('click', '.grocery-item-remove-btn', function() {
        console.log("clicked..", loggedInUser);
        recipeId = $(this).attr("recipe-id");
        loggedInUser.removeItemFromGroceryList(recipeId);
        loggedInUser.save(function() {
            console.log("User Updated!"); 
            updateNavbar();
        })
        
    })
    
   
    $('#nav-bar-cart-link').on('click', function(e){
        e.preventDefault();
        e.stopPropagation();  
        
        if( !isUserLoggedIn() ) {
            $("#navbar-sign-in").click();
            return;
        }
        
        window.location.href = "/my-grocery-list?email=" + loggedInUser.email;
        
    })
    
    $('#nav-bar-my-grocery-list-link').on('click', function(e){
        $('#nav-bar-cart-link').click();
    });
    
    $('.user-settings-sign-out').click(function(){
        console.log("Signing Out..");
        firebase.auth().signOut().then(function() {
            $('#toast-title').text('Success');
            $('#toast-body').text('Sign out successful.');
            $('#generic-success-toast').toast('show');
            loggedInUser = null;
            window.location.href = "/";
        }).catch(function(error) {
            // An error happened.
            console.log("An Error has occured", error);
            updateNavbar();
        });
    })

    $('.ingredient-link').click(function(){
        var id = $(this).attr("recipe-id");
        scrollToRecipe(id);
    });
    
});

//used in single reicpe page
function scrollToRecipe(id){
    var aTag = $("#" + id);
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
}

function isUserLoggedIn(){
    console.log("isUserLoggedIn", loggedInUser != null, loggedInUser)
    return loggedInUser != null;
}

firebase.auth().onAuthStateChanged(function(authUser) {
    if(authUser) {
        console.log("User is logged in");
        email = authUser.email;
        db.collection("users").doc(email).withConverter(userConverter).get().then(function(fbUser) {
            user = fbUser.data();
            loggedInUser = user;
            updateNavbar();
            
            
        }).catch(function(e) {
            console.log(e);
            console.log("Couldnt get user with email: ", authUser.email); 
        });
    } else {
        console.log("User is not logged in.");
        $('#navbar-sign-in').show();
        $('#navbar-user-account').hide();
    }
    updateNavbar();
});


function updateNavbar(){
    //update nav bar based on authentication status
    if(isUserLoggedIn() == false ){
        $('#navbar-sign-in').show();
        $('#navbar-user-account').hide();
        return;
    }

    $('#navbar-sign-in').hide();
    $('#navbar-user-account').show();
    $('#navbar-signed-in-user').text(email);
    updateGroceryList(user);

}

function updateGroceryList(user){
    //need to get the recipes in the cart if they exist
    recipes = [];
    for (var recipe in user.groceryList) {
        recipes.push(new Recipe(ALL_RECIPES[recipe]));
    }
    console.log(recipes.length);
    buildGroceryList(recipes);
    console.log(recipes);
    $('#grocery-list-badge').text(recipes.length);
    
    console.log("Grocery List",recipes);
    
    
    
}

function buildGroceryList(recipes){
    console.log(recipes)
    $("#grocery-list-container").find('.simplebar-content').children('div.widget-cart-item').each(function(i){
        if(this.id != "grocery-list-no-items") {
            this.remove();
        }
        
    })
        
    
    if(recipes == undefined || recipes.length == 0) {
        console.log("User doesnt have anything in their grocery list");
        $('#grocery-list-show-button').attr('disabled','disabled');
        $('#grocery-list-no-items').show();
    } else { 
        $('#grocery-list-show-button').removeAttr('disabled');
        $('#grocery-list-no-items').hide();
    } 
    
    var numOfIngredients = 0;
    for(var i=0; i<recipes.length; i++) {
        var recipe = recipes[i];
        console.log(recipe);
        var recipeImage = (recipe.images != undefined ? recipe.images[0] : "");
        var author = (recipe.attribution != undefined ? recipe.attribution.author : "");
        $("#grocery-list-container").find('.simplebar-content').append(`
            <div class='widget-cart-item py-2 border-bottom'>
                <button recipe-id=`+recipe.id+` class='grocery-item-remove-btn close text-danger' type='button' aria-label='Remove'>
                    <span aria-hidden='true'>×</span>
                </button>
                <div class='media align-items-center'>
                    <a class='d-block mr-2' href='grocery-single.html'>
                        <img style="max-height:64px" width='64' src='`+recipeImage+`' alt='Product'>
                    </a>
                    <div class='media-body'>
                        <h6 class='widget-product-title'>
                            <a href='grocery-single.html'>`+recipe.name+`</a>
                        </h6>
                        <div class='widget-product-meta'>
                            <span class='text-accent mr-2'>
                                `+author+`
                            </span>
                            <span class='text-muted'>x 1</span>
                        </div>
                    </div>
                </div>
            </div>           
        `);    
        numOfIngredients = numOfIngredients + recipe.getNumberOfIngredients();
    }
    
    console.log("num of ingreds",numOfIngredients);
    $('#grocery-list-items').text(numOfIngredients);
    $('#grocery-list-items-hover').text(numOfIngredients);
    
    
}




/*
*/







