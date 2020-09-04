
let ids = [];
$(document).ready(function(){

    $.get( '/api/tags/id', function( data ) {
        ids = data;
    });
    
    $( "#cr-form" ).on( "submit", function(e) {
        e.preventDefault();
        
        var id = $('#text-id').val();
        if(ids.includes(id)) {
            $("#text-id").addClass("is-invalid")
            $("#text-id-feedback").html('ID already exists.')
            $("#cr-form").removeClass('was-validated')
            e.preventDefault()
            e.stopPropagation();
            return;
        }
        var name = $('#text-name').val();
        var categoryId = $('#text-category').val();

        if(categoryId == '-- Select Category --') {
            $("#text-category").addClass("is-invalid")
            $("#cr-form").removeClass('was-validated')
            e.preventDefault()
            e.stopPropagation();
            return;
        }
        
        var data = {
            tag: {
                id,
                name,
                categoryId
            }
        }
    
        
        /* Send to API */
        $.post( '/api/tag/add', data, res => {
            $('#toast-title').text('Success');
            $('#toast-body').text('Tag created successfully!');
            $('#generic-success-toast').toast('show');
            $('html, body').scrollTop(0);
            setTimeout(() => { location.reload(true); }, 500);
        }).fail(err => {
            console.log(err.responseText)
        });     
    });

});

