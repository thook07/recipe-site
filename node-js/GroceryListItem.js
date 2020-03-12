class GroceryListItem {
    
    constructor(ingredientId, amount, recipeId, category) {
        this.id = ingredientId;
        this.amount = [];
        this.amount.push(amount);
        this.recipes = [];
        this.recipes.push(recipeId);
        this.amountMap = {};
        this.amountMap[recipeId] = amount
        this.category = category;
    }
    
    addIngredient(amount, recipeId) {
        this.amount.push(amount);
        this.recipes.push(recipeId)
        this.amountMap[recipeId] = amount
    }
    
    toString(){
        return "Item: [" + this.id + " : " + this.category + " : " + this.amount + "]";
    }
    
}
    

module.exports = GroceryListItem;

