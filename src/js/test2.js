$(document).ready(function(){
   
    var recipe;
    
    $('#test-button-1').click(function(){
        console.log("test-button-1 clicked.");
        
        console.log(localStorage["recipes"])
        
    });
    
    
    
});



 firebase.auth().onAuthStateChanged(function(authUser) {
     if(authUser) {
         console.log(authUser.email, "is logged in")
     } else {
         console.log("No user is logged in");
     }
 });