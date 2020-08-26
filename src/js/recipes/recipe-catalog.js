
$(document).ready(function(){

    //-- Add to wishlist button clicked
    $('.btn-wishlist').on('click', function(e){
        //TODO: 
        // verify that the user is logged in
        // toggle btn-primary and active class on this button
        // send request to add as favorite

        //if the user isn't logged in. The server adds the class notLoggedIn to the button
        if( $(this).hasClass('notLoggedIn') ){
            return;
        }
        
        var recipeId = $(this).attr('data-recipe-id');
        var userId = $(this).attr('data-user-id');
        if( $(this).hasClass('active') == false ) {
            //adding favorite
            $.post( '/api/favorite/add', {
                recipeId: recipeId,
                userId: userId
            }, res => {
                $('#toast-title').text('Success');
                $('#toast-body').text('Favorite Added!');
                $('#generic-success-toast').toast('show');
                console.log('Recipe: ' + recipeId + ' added as a favorite');
                $(this).addClass('btn-primary active');
            }).fail(err => {
                console.log(err.responseText)
            });    
        } else {
            //removing favorite
            $.post( '/api/favorite/remove', {
                recipeId: recipeId,
                userId: userId
            }, res => {
                $('#toast-title').text('Success');
                $('#toast-body').text('Favorite Removed!');
                $('#generic-success-toast').toast('show');
                console.log('Recipe: ' + recipeId + ' removed as a favorite');
                $(this).removeClass('btn-primary active');
            }).fail(err => {
                console.log(err.responseText)
            });
        }
        
    });

    //-- Add to Grocery List Button clicked
    $('.addToGroceryBtn').on('click', async function(e){
        $(this).attr('test','value')
        var recipeId = $(this).attr('data-recipe-id');
        var userId = $(this).attr('data-user-id');
        var selector = "input[type='radio'][name='quantity-"+recipeId+"']:checked";
        var radioId;
        $(selector).each(function(){
            radioId = $(this).attr('data-value');
        });
        var quantity = parseInt(radioId);
        console.log('Adding ' + recipeId + '('+radioId+'x) to grocerylist')
        res = await $.post( '/api/groceryList/add', {
            recipeId: recipeId,
            userId: userId,
            quantity: quantity
        }, res => {
            $('#toast-title').text('Success');
            $('#toast-body').text('Added to List!');
            $('#generic-success-toast').toast('show');
            console.log('Recipe: ' + recipeId + ' added to list');
            updateCart();

        }).fail(err => {
            console.log(err.responseText)
        });    
    });

});

function updateCart(){
    $.get( '/api/grocery-cart/', function( data ) {
        console.log(data);
        $('#cart-hidden').empty();
        $('#cart-hidden').append(data);
    });
}

