/*
   cr-recipe-name
   cr-recipe-url
   cr-recipe-ingredients
   cr-recipe-instructions
   cr-recipe-notes
   cr-recipe-prepTime
   cr-recipe-cookTime
   tag-switches
   cr-recipe-author
   cr-recipe-link-description
   cr-recipe-link
   cr-create-recipe-button








*/
const RECIPE_COLLECTION = "recipes";
$(document).ready(function(){
    
    
    $(".recipe-id").click(function(e) {
        console.log('Testing', this.id);
        var docRef = db.collection(RECIPE_COLLECTION).doc(this.id);
        docRef.get().then(function(doc) {
            if (doc.exists) {
                console.log(doc.get('ingredients'));
                $('#textarea-test').val(JSON.stringify(doc.get('ingredients')));
            } else {
                // doc.data() will be undefined in this case
                $('#textarea-test').val("Couldnt find it..");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
        
    })
    
    $('.upload-btn').click(function(e){ 
        var ingredientArray = [];
        var ingredientId = $('#' + $(this).attr("data-recipe-id") + "-" + $(this).attr("data-recipe-index")).val();
        var ingredientToCheck = $(this).attr("data-recipe-ingredient");
        var recipeId = $(this).attr("data-recipe-id")
        var span = "";
        $("."+recipeId).each(function(i, obj) {
            var amount = $(obj).attr('recipe-amount');
            var ingredient = $(obj).attr('recipe-ingredient');
            var existingId = $(obj).attr('recipe-ingredient-id');
            
            if(ingredient == ingredientToCheck) {
                var map = {
                    'amount':amount,
                    'ingredient': ingredient,
                    'ingredientId': ingredientId
                }
                span = $(obj);
            } else {
                var map = {
                    'amount':amount,
                    'ingredient': ingredient,
                    'ingredientId': existingId
                }
            }
            ingredientArray.push(map);
        });
        var json = {
            "ingredients":ingredientArray
        }
        
        span.attr("recipe-ingredient-id",ingredientId)
        
        let update = db.collection('recipes').doc(recipeId).update(json).then(function() {
            $(this).attr("data-recipe-ingredient",ingredientId);
            console.log("Success! Added " + ingredientId + " to database!");
        }).catch(function(e){
            console.log(e);  
        });
        
        
        
        
    });
    

    /*docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            var ingredients = doc.get('ingredients');
            
            ingredients[1].id = 'sauce';
            
            
            db.collection("recipes-test").doc("test-recipe").update({
                ingredients: ingredients
            });
            
            
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });*/
    
    $(".ingredient-item").click(function(){
        $(this).toggleClass("list-group-item-dark");
        $(this).toggleClass("checked");
        
    });
    
    $("#update-button").on( 'click', function(e){
        e.preventDefault()
        e.stopPropagation();
        
        var category = $("#category-name-input").val();
        
        var itemsToUpdate = []
        $(".checked").each(function() {
            itemsToUpdate.push($(this).attr("id"));
        });
        
        console.log("Updating", itemsToUpdate.length, "ingredients to", category);
        for(i=0; i<itemsToUpdate.length; i++){
            console.log("ingredients >",itemsToUpdate[i],">",category);
            db.collection("ingredients").doc(itemsToUpdate[i]).set({
                id: itemsToUpdate[i],
                category: category
            }).then(function(){
                console.log("Successfully written.")
            }).catch(function(error){
                console.log("Error occurred.", error);
            });
            
            
            
        }
        
        $(".checked").each(function() {
            $(this).removeClass(".checked");
            $(this).removeClass("list-group-item-dark");
        });
        
        
    });
    
    $("#hide-category-button").on( 'click', function(e){
        e.preventDefault()
        e.stopPropagation();
        $(".hasCategory").hide();
    })
    
    
});
   
    