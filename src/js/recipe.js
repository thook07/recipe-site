


$(document).ready(function(){
    

    $("#recipe-signin-button").click(function(){
        console.log("Signin button clicked!");


    });
    
    $("#signup-tab").on("submit", function(e){
        e.preventDefault();
        console.log("Submit!!");
        var name = $('#su-name').val();
        var email = $('#su-email').val();
        var password = $('#su-password').val();
        
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
        });
        
        updateNavbar();
        $("#signin-modal").modal('hide');

    });
    
    $("#signin-tab").on("submit", function(e){
        e.preventDefault();
        console.log("Submit!!");
        var email = $('#si-email').val();
        var password = $('#si-password').val();
        
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(error);
          // ...
        });
        
        updateNavbar();
        $("#signin-modal").modal('hide');
        $('#sign-in-toast').toast('show');
        

    });
    
    $('#sign-out-button').click(function () {
        firebase.auth().signOut().then(function() {
            console.log("User has logged out successfully");
            updateNavbar();
            $('#sign-out-toast').toast('show');
        }).catch(function(error) {
            // An error happened.
            console.log("An Error has occured", error);
            updateNavbar();
        });
    });
    
    $("#wishlist-button").click(function() {
        // - wishlist heart clicked.
        var user = firebase.auth().currentUser;
        console.log("User: ", user);
        console.log("toating..");
        
    });
    
    updateNavbar();
});
    


function updateNavbar(){
    
    //update nav bar based on authentication status
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log("User is logged in", user);
            $('#navbar-sign-in').hide();
            $('#navbar-user-account').show();
            $('#navbar-signed-in-user').text(user.email);
            
            
        } else {
            console.log("USer is not logged in.");
            $('#navbar-sign-in').show();
            $('#navbar-user-account').hide();
        }
    });
    
    
    
    
    
}

/*
*/







