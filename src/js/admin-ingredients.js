

$(document).ready(function(){

    $.get( '/api/users/', function( data ) {
        $('#list-users').append(data);
    });

    $('#list-users-list').on('click', function(e){
        $('#list-users').empty();
        $.get( '/api/users/', function( data ) {
            $('#list-users').append(data);
        });

    });

    $('#list-recipeIngredients-list').on('click', function(e){
        $('#list-recipeIngredients').empty();
        $.get( '/api/recipe-ingredients?sendTable=true', function( data ) {
            $('#list-recipeIngredients').append(data);
        });

    });

    $('#list-ingredients-list').on('click', function(e){
        $('#list-ingredients').empty();
        $.get( '/api/ingredients?sendTable=true', function( data ) {
            $('#list-ingredients').append(data);
        });

    });

    $('#list-tags-list').on('click', function(e){
        $('#list-tags').empty();
        $.get( '/api/tags?sendTable=true', function( data ) {
            $('#list-tags').append(data);
        });

    });
    
});

