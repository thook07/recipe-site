var GroceryListItem = require("../node-js/GroceryListItem");
var Ingredient = require("../node-js/Ingredient");
var GroceryList = require("../node-js/GroceryList");

class RecipeGroup {
    
    constructor(recipes) {
        this.recipes = recipes
    }
    
    getGroceryList(){
        
        var groceryList = new GroceryList()
        for(var i=0; i<this.recipes.length; i++){
            var recipe = this.recipes[i];
            console.log("Looping Recipe: " + recipe.id)
            for(var j=0; j<recipe.recipeIngredients.length; j++) {
                var ri = recipe.recipeIngredients[j];
                groceryList.addItem(ri.ingredient.id, ri.amount, recipe.id, ri.ingredient.category)
            }
        };
        return groceryList;
    }
    
    
    
    
}



module.exports = RecipeGroup;