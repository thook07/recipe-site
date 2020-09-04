$(document).ready(function(){

    $('#filterBtn').on('click', function(){
        document.location.href = "/admin/tags?q=" + $("#q").val();
    })

    $('.editBtn').on('click', function(){
        var tag = JSON.parse($(this).attr('data-tag'))

        $('#text-id').val(tag.id)
        $('#text-name').val(tag.name)

        $('#text-category > option').each(function(){
            if( $(this).val() == tag.category ) {
                $(this).attr('selected', 'selected');
            }
        });

        $('#update-modal').modal('show');

    });

    $('#update-btn').on('click', function(){
        var data = {
            tag: {
                id: $('#text-id').val(),
                name: $('#text-name').val(),
                categoryId: $('#text-category').val()
            }
        }
        
        $.post('/api/tag/update', data, res => {
            $('#update-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    })
    
});