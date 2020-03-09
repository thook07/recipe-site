

const ALL_RECIPES = {};
var recipesLoaded = false;
var loggedInUser;
$(document).ready(function(){

    db.collection("recipes").withConverter(recipeConverter).get().then(function(snapshot) { 
        snapshot.forEach(function(doc) {
            recipe = doc.data();
            ALL_RECIPES[recipe.id] = recipe;
        });
        recipesLoaded = true;
    });
    
    
    $("#recipe-signin-button").click(function(){
        console.log("Signin button clicked!");


    });
    
    $("#signup-tab").on("submit", function(e){
        
        if ($('#signup-tab')[0].checkValidity() === false) {
            e.preventDefault()
            e.stopPropagation();
            
            return;
        } 
        
        var name = $('#su-name').val();
        var email = $('#su-email').val();
        var password = $('#su-password').val();
        
        console.log("Create User - Email and Password", email, password);
        firebase.auth().createUserWithEmailAndPassword(email, password).then(function(result) {
            //successfully created user. now lets update.
            console.log("Success. Updating user: ", displayName)
            return result.user.updateProfile({
                displayName: name
            });
        }).catch(function(error) {
            console.log(error);
        });
        
        
        updateNavbar();
        $("#signin-modal").modal('hide');

    });
    
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
    
    $('#sign-out-button').click(function () {
        console.log("Signing Out..");
        firebase.auth().signOut().then(function() {
            $('#toast-title').text('Success');
            $('#toast-body').text('Sign out successful.');
            $('#generic-success-toast').toast('show');
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
    
    $(".grocery-item-add-btn").click(function(){
        recipeId = $(this).attr("recipe-id");
        console.log("Adding recipe to list", recipeId);
        if(loggedInUser == null) {
            console.log("need to show signin page...");
            return;
        }
        
        if(loggedInUser.addItemToGroceryList(recipeId) != null){
            loggedInUser.save(function(){
                updateNavbar();
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
    
   
});

$(window).on('load', function() {
    updateNavbar();
});
    


function updateNavbar(){
    
    //update nav bar based on authentication status
    firebase.auth().onAuthStateChanged(function(authUser) {
        if (authUser) {
            

            firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
                console.log("token", idToken);
                
                data = {}
                data["key1"] = "value";
                data["token"] = idToken;
                
                
                $.ajax({
                    url: '/validateToken',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    success: function(response){
                        console.log(response);
                    }
                });
 



            }).catch(function(error) {
            // Handle error
            });
            
            
            
            console.log("User is logged in", authUser);
            $('#navbar-sign-in').hide();
            $('#navbar-user-account').show();
            $('#navbar-signed-in-user').text(authUser.email);
            
            db.collection("users").doc(authUser.email).withConverter(userConverter).get().then(function(fbUser) {
                user = fbUser.data();
                loggedInUser = user;
                updateGroceryList(user);
                
                
            }).catch(function(e) {
                console.log(e);
                console.log("Couldnt get user with email: ", authUser.email); 
            });
            
            
            
            
            
        } else {
            console.log("USer is not logged in.");
            $('#navbar-sign-in').show();
            $('#navbar-user-account').hide();
        }
    });

}

function updateGroceryList(user){
    //need to get the recipes in the cart if they exist
    
    var recipes = [];
    user.groceryList.forEach(function(recipe){
        recipes.push(ALL_RECIPES[recipe]);
    });
    buildGroceryList(recipes);
    $('#grocery-list-badge').text(recipes.length);
    
    console.log("Grocery List",recipes);
    
    
    
}

function buildGroceryList(recipes){
    
    console.log(document.readyState);
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
    recipes.forEach(function(recipe){
        
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
    });
    
    console.log("num of ingreds",numOfIngredients);
    $('#grocery-list-items').text(numOfIngredients);
    $('#grocery-list-items-hover').text(numOfIngredients);
    
    
}

/*
*/







