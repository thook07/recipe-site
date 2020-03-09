class GroceryListItem {
    
    constructor(ingredientId, amount, recipeId) {
        this.id = ingredientId;
        this.amount = [];
        this.amount.push(amount);
        this.recipes = [];
        this.recipes.push(recipeId);
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

