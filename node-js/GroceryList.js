var GroceryListItem = require("./GroceryListItem")

class GroceryList {
    
    
    constructor() {
        this.items = [];
    }
    
    addItem(id, amount, recipeId) {
        
        var alreadyExists = false;
        for(i=0; i<this.items.length; i++){
            if(this.items[i].id == id) {
                alreadyExists = true;
                break;
            } 
        }
        
        if( alreadyExists ) {
            this.items[i].addIngredient(amount, recipeId);
        } else {
            this.items.push(new GroceryListItem(id,amount,recipeId));
        }
        
        return true;
    }
    
    toString(){
        return this.items;
    }
    
}
   

module.exports = GroceryList;