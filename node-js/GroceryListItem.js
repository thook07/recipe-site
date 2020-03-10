class GroceryListItem {
    
    constructor(ingredientId, amount, recipeId, ing) {
        this.id = ingredientId;
        this.amount = [];
        this.amount.push(amount);
        this.recipes = [];
        this.recipes.push(recipeId);
        this.ingredient = ing;
    }
    
    addIngredient(amount, recipeId) {
        this.amount.push(amount);
        this.recipes.push(recipeId)
    }
    
    
    
    toString(){
        return "Item: [" + this.id + " : " + this.amount + " : " + this.recipes + "]";
    }
    
}
    

module.exports = GroceryListItem;

