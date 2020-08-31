$(document).ready(function(){
    
    $('.removeBasket').on('click', function(e){
        var recipeId = $(this).attr('data-recipe-id');
        var userId = $(this).attr('data-user-id');
        console.log('Remove ' + recipeId);

        var data = {
            recipeId: recipeId,
            userId: userId
        }

        $.post( '/api/groceryList/remove', data, res => {
            //$('#toast-title').text('Success');
            //$('#toast-body').text('Removed from List!');
            //$('#generic-success-toast').toast('show');
            console.log('Recipe: ' + recipeId + ' removed to list');
            location.reload(true);
    
        }).fail(err => {
            console.log(err.responseText)
        });    


    });

});

