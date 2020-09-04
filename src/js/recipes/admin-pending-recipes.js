
$(document).ready(function(){

    $('#filterBtn').on('click', function(){
        if( $("#q").val() != '') {
            document.location.href = "/admin/recipes?q=" + $("#q").val();
        } else if( $("#select-recipe-id").val() != 'Select Recipe...') {
            document.location.href = "/admin/recipes?r=" + $("#select-recipe-id").val();
        }
    })
    
    $('.approveBtn').on('click', function() {
        var recipeId = $(this).attr('data-recipe-id');
        var recipeName = $(this).attr('data-recipe-name');
        $('#yesNoRecipeName').html(recipeName);
        $('#approvedBtnModal').attr('data-recipe-id',recipeId);

        $('#yes-no-modal').modal('show');
    });

    $('#approvedBtnModal').on('click', function() {
        var recipeId = $(this).attr('data-recipe-id');
        var data = {
            attributes: {
                approved: 1
            }
        }
        $.post('/api/recipes/'+recipeId+'/update', data, res => {
            $('#yes-no-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    });

});
