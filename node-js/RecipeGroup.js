var GroceryListItem = require("../node-js/GroceryListItem");
var Ingredient = require("../node-js/Ingredient");
var GroceryList = require("../node-js/GroceryList");
var log = require('../logger.js');

class RecipeGroup {
    
    constructor(recipes) {
        log.trace("[RecipeGroup] Entering constructor...");
        this.recipes = recipes
    }
    
    getGroceryList(){
        log.trace("[RecipeGroup] Entering getGroceryList...");
        var groceryList = new GroceryList()
        log.trace("[RecipeGroup] Recipe Length: ["+this.recipes.length+"]")
        for(var i=0; i<this.recipes.length; i++){
            var recipe = this.recipes[i];
            log.trace("[RecipeGroup] Looping Recipe: " + recipe.id + " going into for loop...");
            for(var j=0; j<recipe.recipeIngredients.length; j++) {
                var ri = recipe.recipeIngredients[j];
                log.trace("[RecipeGroup] in for loop. Getting recipeIngredient. And adding ingredient to list.");
                if(ri.isRecipe == 0) {
                    log.trace("[RecipeGroup] groceryList.addItem(["+ri.ingredient+"] ["+ri.amount+"] ["+recipe.id+"]");
                    if(ri.ingredient.id === 'salt' || ri.ingredient.id === 'water') {
                        log.trace("[RecipeGroup] salt or water. Removing from list.");
                    } else {
                        groceryList.addItem(ri.ingredient.id, ri.amount, recipe.id, ri.ingredient.category);
                    }
                } else {
                    log.trace("[RecipeGroup] This is a nested recipe. skipping ["+ri.recipe.id+"]")
                    //groceryList.addNestedRecipeId(recipe.id, ri.recipe.id);
                }
            }
        }
        log.trace("Returning GroceryList: ["+groceryList+"]")
        return groceryList;
    }

    addNestedRecipe(recipe, parentId) {
        log.trace("[RecipeGroup] Entering addNestedRecipe. ["+recipe.id+"]");
        for(var i=0; i<this.recipes.length; i++){
            log.trace("[RecipeGroup] Comparing ["+this.recipes[i].id+"] to ["+parentId+"]")
            if(this.recipes[i].id == parentId){
                log.trace("[RecipeGroup] Found parent recipe. Adding ingredients! Length Before: ["+this.recipes[i].recipeIngredients.length+"]");
                this.recipes[i].recipeIngredients = this.recipes[i].recipeIngredients.concat(recipe.recipeIngredients);
                log.trace("[RecipeGroup] Length After: ["+this.recipes[i].recipeIngredients.length+"]")
            }
        }
        
    }

    addRecipes(recipes){
        log.trace("[RecipeGroup] Entering addRecipes. Length Before["+this.recipes.length+"]....");
        this.recipes = this.recipes.concat(recipes);
        log.trace("[RecipeGroup] ... Length After ["+this.recipes.length+"]");
        
    }

    addRecipe(recipe){
        log.trace("[RecipeGroup] Entering addRecipe. Length Before["+this.recipes.length+"]....");
        this.recipes.push(recipe);
        log.trace("[RecipeGroup] ... Length After ["+this.recipes.length+"]");
    }
    
    
    
    
}



module.exports = RecipeGroup;