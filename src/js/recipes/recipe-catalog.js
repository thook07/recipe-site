
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
        var recipeId = $(this).attr('data-recipe-id');
        var userId = $(this).attr('data-user-id');
        var selector = "input[type='radio'][name='quantity-"+recipeId+"']:checked";
        var radioId;
        $(selector).each(function(){
            radioId = $(this).attr('data-value');
        });
        var quantity = parseInt(radioId);
        console.log('Adding ' + recipeId + '('+radioId+'x) to grocerylist')
        addToGroceryList(recipeId, userId, quantity);
    });

    $('#mobileAddToGroceryBtn').on('click', async function(e){
        var recipeId = $(this).attr('data-recipe-id');
        var userId = $(this).attr('data-user-id');
        var selector = "input[type='radio'][name='mobile-add-to-cart-quantity']:checked";
        var radioId;
        $(selector).each(function(){
            radioId = $(this).attr('data-value');
        });
        var quantity = parseInt(radioId);
        console.log('Adding ' + recipeId + '('+radioId+'x) to grocerylist');
        addToGroceryList(recipeId, userId, quantity);
        $('#add-to-cart').modal('hide');
    });


    $('.btn-wishlist-left').on('click', function(e){
        $('#mobileAddToGroceryBtn').attr('data-recipe-id', $(this).attr('data-recipe-id'));
        $('#add-to-cart-recipe-name').html($(this).attr('data-recipe-name'));
        $('#add-to-cart').modal('show');
    });

    $('#sorting').on('change', function(e) {
        var sortBy = $(this).val()
        window.location.replace("/catalog?sort=" + sortBy);
    });

    $('.filterTag').on('click', function(){ 
        document.location.href = '/catalog?tags='+$(this).attr('tag-id');
    });


});

function updateCart(){
    $.get( '/api/grocery-cart/', function( data ) {
        console.log(data);
        $('#cart-hidden').empty();
        $('#cart-hidden').append(data);
    });
}

function addToGroceryList(recipeId, userId, quantity){

    var data = {
        recipeId: recipeId,
        userId, userId,
        quantity, quantity
    }

    $.post( '/api/groceryList/add', data, res => {
        $('#toast-title').text('Success');
        $('#toast-body').text('Added to List!');
        $('#generic-success-toast').toast('show');
        console.log('Recipe: ' + recipeId + ' added to list');
        updateCart();

    }).fail(err => {
        console.log(err.responseText)
    });    

}
