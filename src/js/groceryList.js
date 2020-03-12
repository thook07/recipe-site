var showChecked = true;
var user = null
$(document).ready(function(){
   
    
    $(".grocery-item").click(function(){
        console.log("Show Checked [",showChecked,"]")
        var idCheck = $(this).attr("data-check");
        var id = $(this).attr("data-text");
        $("#"+idCheck).toggleClass("d-none");
        $(this).toggleClass("list-group-item-dark");
        $(this).toggleClass("checked");
        
        if($(this).hasClass("checked") && !showChecked) {
            $(".checked").hide();
        }
        

        if ( $("#"+id).parent().is( "del" ) ) {
            $("#"+id).unwrap();
        } else {
            $("#"+id).wrap( "<del></del>" );
        }
        
    });
    
    $("#hide-checked").click(function(){
        showChecked = false;
        $(".checked").hide();
        $("#hide-checked").addClass("btn-primary");
        $("#hide-checked").removeClass("btn-outline-primary");
        $("#show-checked").removeClass("btn-primary");
        $("#show-checked").addClass("btn-outline-primary");
    });
    
    $("#show-checked").click(function(){
        showChecked = true;
        $(".checked").show();
        $("#hide-checked").addClass("btn-outline-primary");
        $("#hide-checked").removeClass("btn-primary");
        $("#show-checked").addClass("btn-primary");
        $("#show-checked").removeClass("btn-outline-primary");
    });
    
    $(".btn-wishlist").click(function(){ 
        var recipeId = $(this).attr("data-recipe");
        console.log("remove button clicked on",recipeId);
        
        console.log(user.email);
        db.collection("users").doc(user.email).get().then(function(doc){
            
            var list = doc.data().groceryList;
            console.log(list);
            
            var index = list.indexOf(recipeId);
            if (index !== -1) {
                list.splice(index, 1)
            }
            db.collection("users").doc(user.email).update({groceryList: list}).then(function(){
                location.reload();
            }).catch(function(e){
                console.log("Error",e)
            });
        
        
        }).catch(function(error){
            console.log("Error occurred.", error);
        });
        
        
        
    });
    
    
});

firebase.auth().onAuthStateChanged(function(authUser) {
    if(authUser) {
        console.log("User is logged in", authUser.email);
        user = authUser;
    } else {
        console.log("User is not logged in..");    
    }   
    
});