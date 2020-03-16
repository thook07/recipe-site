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

    $(".update-btn").click(function(e){
        e.stopPropagation();
        e.preventDefault();
        var id = $(this).attr("ri-id");
        var action = $("#"+id).val();
        if(action.length == 1) {
            //update isRecipe
            console.log("Updating isRecipe to ["+action+"] for recipeIngredient ["+id+"]");

            var data = {};
            data["id"] = id;
            data["isRecipe"] = action;

            framework.post("http://3.14.147.18:1338/updateRecipeIngredient", data, function(res, err){
                if(err) {
                    console.log("Error:",err)
                }
                console.log(res);   
            });
        } else {
            //update ingredient
            console.log("Updating ingredientId to ["+action+"] for recipeIngredient ["+id+"]")
            var data = {};
            data["id"] = id;
            data["ingredientId"] = action;

            framework.post("http://3.14.147.18:1338/updateRecipeIngredient", data, function(res, err){
                if(err) {
                    console.log("Error:",err)
                }
                console.log(res);   
            });
        }
    });
    

    $("td.update-column").click(function(){
        console.log("clickeD");
        var column = $(this).attr("data-name");
        var recipeId = $(this).parent().attr("data-id");

        console.log("column", column)
        console.log("recipeId", recipeId);

        $("#col-"+recipeId).html(column);
        

    });

    $(".update-recipe-btn").click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        var id = $(this).attr("ri-id");
        var column = $("#col-"+id).html();
        var value = $("#"+id).val();

        console.log("id",id);
        console.log("column",column);
        console.log("value",value);

        var data = {};
        data["id"] = id;
            
        if(column == "images") {
            var imageLinks = value.split(",");
            data["images"] = imageLinks;
        }

        if(column == "name") {
            data["name"] = value;
        }

        if(column == "cookTime") {
            data["cookTime"] = value;
        }

        if(column == "prepTime") {
            data["prepTime"] = value;
        }
    
        framework.post("http://3.14.147.18:1338/updateRecipe", data, function(res, err){
            if(err) {
                console.log("Error:",err)
            }
            console.log(res);   
        });
    });

    $(".update-recipe-ing-btn").click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        var id = $(this).attr("ri-id");
        var column = $("#col-"+id).html();
        var value = $("#"+id).val();

        console.log("id",id);
        console.log("column",column);
        console.log("value",value);

        var data = {};
        data["id"] = id;

        if(column == "id") {
            data["id"] = value;
            return;
        }

        if(column == "ingredient") {
            data["ingredient"] = value;
        }

        if(column == "ingredientId") {
            data["ingredientId"] = value;
        }

        if(column == "recipeId") {
            data["recipeId"] = value;
        }

        if(column == "amount") {
            data["amount"] = value;
        }

        if(column == "isRecipe") {
            data["isRecipe"] = value;
        }
    
        framework.post("http://3.14.147.18:1338/updateRecipeIngredient", data, function(res, err){
            if(err) {
                console.log("Error:",err)
            }
            console.log(res);   
        });
    });




});
   
    