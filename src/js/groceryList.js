var showChecked = true;
var email = null;
var user = null;
var groceryListMap = {};
let recipes = {};
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
            delete list[recipeId];
            console.log(list);

            db.collection("users").doc(user.email).update({groceryList: list}).then(function(){
                location.reload();
            }).catch(function(e){
                console.log("Error",e)
            });
        
        
        }).catch(function(error){
            console.log("Error occurred.", error);
        });
        
        
        
    });
    
    $(".add-serving-btn").click(function(){
        console.log("Remove");
        var recipeId = $(this).attr("recipe-id");
        var numServings = Number($(".label-" + recipeId).html());

        numServings = numServings + 1;
        groceryListMap[recipeId] = numServings
        console.log("User Email:",user,email);
        db.collection("users").doc(email).update({
            groceryList: groceryListMap
        }).then(function(){
            $(".label-" + recipeId).html(numServings);
            console.log(recipeId,numServings);

            $(".amt-"+recipeId).each(function(index,element){
                var amount = $(element).attr("data-amount");
                var newAmount = updateRecipeServings(amount, numServings);
                $(element).html(newAmount);
            });

        });




        
    });

    $(".remove-serving-btn").click(function(){
        console.log("Remove");
        var recipeId = $(this).attr("recipe-id");
        var numServings = Number($(".label-" + recipeId).html());
        numServings = numServings - 1;
        if(numServings < 1) {
            numServings = 1
        }
        groceryListMap[recipeId] = numServings
        console.log("User Email:",user,email);
        db.collection("users").doc(email).update({
            groceryList: groceryListMap
        }).then(function(){
            $(".label-" + recipeId).html(numServings);
            console.log(recipeId,numServings);

            $(".amt-"+recipeId).each(function(index,element){
                var amount = $(element).attr("data-amount");
                var newAmount = updateRecipeServings(amount, numServings);
                $(element).html(newAmount);
            });
        });
        
    });
    


});

firebase.auth().onAuthStateChanged(function(authUser) {
    if(authUser) {
        console.log("User is logged in", authUser.email);
        user = authUser;
        email = user.email;
        console.log("getting user data...");
        db.collection("users").doc(user.email).get().then(function(doc){
            console.log("Sucess",doc.data());
            groceryListMap = doc.data().groceryList;
            var recipeIds = [];
            for (var recipe in groceryListMap) {
                console.log("adding recipe", recipe, "to list")
                recipeIds.push(recipe);
            }
            console.log("getting recipes from id", recipeIds);
            /*framework.post("http://3.14.147.18:1338/getRecipes", {"recipeIds": recipeIds}, function(res, err){
                console.log(res);
                if(err) {
                    console.log("Error:",err)
                }
                recipeGroup = res.recipeGroup
                for(var i=0; i<recipeGroup.length; i++){
                    console.log(recipeGroup[i]);
                    recipes[recipeGroup[i].id] = recipeGroup[i]
                }
                
            });
            */
        });




    } else {
        console.log("User is not logged in..");    
    }   
    
});

function updateRecipeServings(amount, servings) {
    //first check for space
    if(servings == 1) {
        return amount
    } else {
        return amount + " x" + servings;
    }

    return amount + " x" + servings;
    var strArray = amount.split(' ');
    var quantity = strArray[0];
    strArray.shift();
    var measurement = strArray.join().replace(/,/g,' ');

    if( $.isNumeric(quantity) ) {
        var num = Number(quantity);
        num = num * servings
        return num + " " + measurement;
    }

    return;



}




