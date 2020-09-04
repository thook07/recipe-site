$(document).ready(function(){

    $('#filterBtn').on('click', function(){
        document.location.href = "/admin/ingredients?q=" + $("#q").val();
    })

    $('.editBtn').on('click', function(){
        var id = $(this).attr('data-id') || '';
        var name = $(this).attr('data-name') || null;
        var catId = $(this).attr('data-catId') || '';

        $('#text-id').val(id)
        $('#text-name').val(name)

        $('#text-category > option').each(function(){
            if( $(this).val() == catId ) {
                $(this).attr('selected', 'selected');
            }
        });

        $('#update-modal').modal('show');

    });

    $('.deleteBtn').on('click', function() {
        var ingredientId = $(this).attr('data-id');
        $('#deleteBtnApproved').attr('data-id',ingredientId);
        $('#yes-no-modal').modal('show');
    });

    $('#deleteBtnApproved').on('click', function() {
        var ingId = $(this).attr('data-id');
        var data = {
            id: ingId
        }
        $.post('/api/ingredient/delete', data, res => {
            $('#yes-no-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    });

    $('#update-ingredient-btn').on('click', function(){
        var data = {
            ingredient: {
                id: $('#text-id').val(),
                name: $('#text-name').val(),
                categoryId: $('#text-category').val()
            }
        }
        console.log(data);

        $.post('/api/ingredient/update', data, res => {
            $('#update-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    })
    
});