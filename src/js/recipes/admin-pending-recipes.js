
$(document).ready(function(){

    $('#filterBtn').on('click', function(){
        if( $("#q").val() != '') {
            document.location.href = "/admin/pending-recipes?q=" + $("#q").val();
        } else if( $("#select-recipe-id").val() != 'Select Recipe...') {
            document.location.href = "/admin/pending-recipes?r=" + $("#select-recipe-id").val();
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
            if( $('#notifyControl').is(':checked') ) {
                sendNotification(recipeId);
            }
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    });

    $('.deleteBtn').on('click', function() {
        var recipeId = $(this).attr('data-recipe-id');
        var recipeName = $(this).attr('data-recipe-name');
        $('#deleteRecipeName').html(recipeName);
        $('#deleteBtnModal').attr('data-recipe-id',recipeId);

        $('#delete-modal').modal('show');
    });

    $('#deleteBtnModal').on('click', function() {
        var recipeId = $(this).attr('data-recipe-id');
        
        var data = {
            id: recipeId
        }

        $.post('/api/recipes/delete', data, res => {
            $('#delete-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    });

});

function sendNotification(id) {
    var data = {
        recipeId: id
    };

    $.post('/api/notify/new-recipe', data, res => {
        console.log(data);
    }).fail(err => {
        console.log(err);
    });


}
