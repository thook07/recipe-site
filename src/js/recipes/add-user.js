
var recipeId = "";
let emails = [];
$(document).ready(function(){

    $.get( '/api/users/email', function( data ) {
        emails = data;
    });
    
    $( "#cr-form" ).on( "submit", function(e) {
        e.preventDefault();
        
        var email = $('#text-email').val();
        var password = $('#text-password').val();
        var role = $('#text-role').val();
        
        var data = {
            user: {
                email,
                password,
                role
            }
        }
    
        console.log(data);
        
        /* Send to API */
        $.post( '/api/user/add', data, res => {
            $('#toast-title').text('Success');
            $('#toast-body').text('User created successfully!');
            $('#generic-success-toast').toast('show');
            $('html, body').scrollTop(0);
            setTimeout(() => { location.reload(true); }, 500);
        }).fail(err => {
            console.log(err.responseText)
        });     
    });

});

