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
        
        console.log(recipeId)
        let update = db.collection('recipes').doc(recipeId).update(json);
        
        
        
        
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
    

    
    
});
   
    