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
   
    