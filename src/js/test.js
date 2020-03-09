$(document).ready(function(){
   
    var recipe;
    
    $('#test-button-1').click(function(){
        console.log("test-button-1 clicked.");
        
        db.collection("recipes-test").doc("test-recipe")
        .withConverter(recipeConverter)
        .get().then(function(doc) {
            if (doc.exists){
                // Convert to City object
                recipe = doc.data();

                recipe.name = 'Test Recipe';
                recipe.notes = ['my note 1','my note 2','etc.'];
                recipe.cookTime = 20;
                recipe.prepTime = 30;
                
                var attribution = {
                    'author': 'Nora Cooks',
                    'link': 'www.noracooks.com'
                }
                recipe.attribution = attribution;

            } else {
                console.log("No such document!")
            }}).catch(function(error) {
                console.log("Error getting document:", error)
        });

        
    });
    
     $('#test-button-2').click(function(){
        console.log("test-button-2 clicked.");
        
        db.collection("recipes-test").doc("test-recipe")
        .withConverter(recipeConverter)
        .set(recipe);

    });

    $('#test-button-3').click(function(){
        console.log("test-button-3 clicked.");

        db.collection("recipes-test")
        .withConverter(recipeConverter).withConverter(recipeConverter).get().then(function(snapshot) {
            
            var recipes = [];
            snapshot.forEach((doc) => {
                recipe = doc.data();
                console.log(recipe.toString());
                recipes.push(recipe);
            });
        
            console.log(recipes);
        });
    });
    
    
    $('#test-button-4').click(function(){
        console.log("test-button-4 clicked.");

        db.collection("recipes-test").doc("test-recipe")
        .withConverter(recipeConverter)
        .set(recipe);


    });

    
    
});