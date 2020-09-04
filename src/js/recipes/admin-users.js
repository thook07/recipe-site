$(document).ready(function(){

    $('#filterBtn').on('click', function(){
        document.location.href = "/admin/users?q=" + $("#q").val();
    })

    $('#showAdminBtn').on('click', function(){
        document.location.href = "/admin/users?role=admin"
    })

    $('#showAllBtn').on('click', function(){
        document.location.href = "/admin/users?showAll=true"
    })

    $('.editBtn').on('click', function(){
        var user = JSON.parse($(this).attr('data-user'))

        $('#text-id').val(user.id)
        $('#text-email').val(user.email)

        $('#text-role > option').each(function(){
            if( $(this).val() == user.role ) {
                $(this).attr('selected', 'selected');
            }
        });

        $('#update-modal').modal('show');

    });

    $('#update-btn').on('click', function(){
        var data = {
            user: {
                id: $('#text-id').val(),
                email: $('#text-email').val(),
                role: $('#text-role').val()
            }
        }

        var password = $('#text-password').val()
        if(password != undefined && password != '') {
            data.user.password = password
        }
        
        $.post('/api/user/update', data, res => {
            $('#update-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    })

    $('.resetPasswordBtn').on('click', function() {
        var userId = $(this).attr('data-user-id');
        $('#resetPasswordBtnApproved').attr('data-user-id',userId);

        $('#reset-password-confirm-modal').modal('show');
    });

    $('#resetPasswordBtnApproved').on('click', function() {
        var userId = $(this).attr('data-user-id');
        var data = {
            user: {
                id: userId,
                password: $('#text-reset-password').val()
            }
        }
        $.post('/api/user/update', data, res => {
            $('#reset-password-confirm-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    });

    
});

