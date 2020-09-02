$(document).ready(function(){

    $('#filterBtn').on('click', function(){
        if( $("#q").val() != '') {
            document.location.href = "/admin/recipe-ingredients?q=" + $("#q").val();
        } else if( $("#select-recipe-id").val() != 'Select Recipe...') {
            document.location.href = "/admin/recipe-ingredients?r=" + $("#select-recipe-id").val();
        } else if( $("#select-ingredient-id").val() != 'Select Ingredient...') {
            document.location.href = "/admin/recipe-ingredients?i=" + $("#select-ingredient-id").val();
        } 
    })

    $('.editBtn').on('click', function(){
        var data = $(this).attr('data-ri');
        data = JSON.parse(data);
        
        $("#text-id").val(data.id)
        $("#text-amount").val(data.amount)
        $("#text-ingredientDescription").val(data.ingredientDescription)
        
        $('#text-recipeId > option').each(function(){
            if( $(this).val() == data.recipeId ) {
                $(this).attr('selected', 'selected');
            }
        });
        $('#text-ingredientId > option').each(function(){
            if( $(this).val() == data.ingredientId ) {
                $(this).attr('selected', 'selected');
            }
        });
        $('#text-isRecipe > option').each(function(){
            if( $(this).val() == data.isRecipe ) {
                $(this).attr('selected', 'selected');
            }
        });



        $('#update-modal').modal('show');

    });

    $('#update-btn').on('click', function(){
        var data = {
            recipeIngredient: {
                id: $('#text-id').val(),
                amount: $('#text-amount').val(),
                ingredientDescription: $('#text-ingredientDescription').val(),
                ingredientId: $('#text-ingredientId').val(),
                recipeId: $('#text-recipeId').val(),
                isRecipe: $('#text-isRecipe').val()
            }
        }
        
        $.post('/api/recipe-ingredient/update', data, res => {
            $('#update-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    })
    
});