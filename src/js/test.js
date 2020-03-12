$(document).ready(function(){
   
    var recipe;
    
    $('#test-button-1').click(function(){
        console.log("test-button-1 clicked.");
        
        console.log("Storing to local cache");
        
        db.collection("recipes").withConverter(recipeConverter).get().then(function(docs){
            
            var recipes = [];
            docs.forEach(function(doc){
                var recipe = doc.data();
                console.log("adding recipe name:",recipe.name);
                recipes.push(recipe.name);
            });
            
            localStorage["recipes"] = recipes;
            console.log("Done!",recipes.length," recipes were added.");
        })
        
        localStorage["recipes"] = ["One","Two", "Three"];
        
        
    });
    
     $('#test-button-2').click(function(){
         
         var data = {}
         data.recipeId = "gravy"
         
       framework.post("http://3.14.147.18:1338/getRecipe", data, function(res, err){
           if(err) {
               console.log("Error:",err)
           }
           console.log(res);
           
       });
         
         
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



 firebase.auth().onAuthStateChanged(function(authUser) {
     if(authUser) {
         console.log(authUser.email, "is logged in")
     } else {
         console.log("No user is logged in");
     }
 });