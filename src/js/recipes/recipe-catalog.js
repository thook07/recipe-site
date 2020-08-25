
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

});

