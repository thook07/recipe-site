
$(document).ready(function(){
    $("#update-list-btn").on('click', function(e){
        var recipeMap = {};
        $('#list-on-load > .item').each(function () { 
            recipeMap[$(this).attr('data-recipe-id')] = $(this).attr('data-recipe-quantity');
         });
         
        var changes = [];
        for (var recipeId in recipeMap) {
            var quantityOnLoad = recipeMap[recipeId];
            var quantityId = 'quantity-'+recipeId;
            if( $('#'+quantityId).val() == quantityOnLoad ) {
                //no change. dont do anything
            } else {
                changes.push({
                    recipeId: recipeId,
                    quantity: $('#'+quantityId).val()
                })
            }
        }

        if(changes.length > 0) {
            var data = {
                userId: $(this).attr('data-user-id'),
                changes: changes
            }

            $.post( '/api/groceryList/update', data, res => {
                location.reload(true);
            }).fail(err => {
                console.log(err.responseText)
            });   
        } else {
            //no changes
        } 


    })

    $('.remove-from-list').on('click', function(){
        var recipeId = $(this).attr('data-recipe-id');
        var quantityId = 'quantity-'+recipeId;
        $('#'+quantityId).val(0)
        console.log("Remove Recipe from List: " + recipeId);
    })
});
