


$(document).ready(function(){
    

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







