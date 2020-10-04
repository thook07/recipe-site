var oldTags = [];
$(document).ready(function(){

    $('#filterBtn').on('click', function(){
        document.location.href = "/admin/recipe-tags?r=" + $("#recipeSelect").val();
    })

    $('#addTagBtn').on('click', async function(){
        var recipeId = $('#recipeSelect').val();
        $('#tag-container').empty();
        if( recipeId ) {
            $.get( '/api/recipe-tags?r=' + recipeId, function( data ) {
                var tags = data;
                oldTags = [];
                for( const tag of tags ) {
                    oldTags.push(tag.id);
                    addTagToContainer(tag.id, tag.category + ': ' + tag.name, true)
                }

                $('#add-btn').attr('data-recipe-id', recipeId);
                $('#add-modal').modal('show');
            });

            
        }
    });

    $('#add-btn').on('click', function() {
        var recipeId = $(this).attr('data-recipe-id');
        var tags = getTags();

        var tagChanges = parseTagChanges(tags, oldTags);
        var data = {
            tags: tagChanges,
            recipeId
        }
        $.post('/api/recipe-tag/add', data, res => {
            $('#add-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    });

    $('#add-tag-btn').on('click', function(){
        //cr-recipe-tag-select
        var tagId= $('#cr-recipe-tag-select').val()
        var tagName= $('#cr-recipe-tag-select :selected').html();

        var tagIds = getTags();
        console.log(tagIds);
        console.log(tagIds.includes(tagId));
        if(tagIds.includes(tagId)) {
            //duplciate
            return;
        }

        addTagToContainer(tagId, tagName, false)

        
    });

    $('.removeTagBtn').on('click', function(){
        $(this).parent().remove();
    });

    $('.deleteBtn').on('click', function(){
        var recipeId = $(this).attr('data-rtag-recipeId');
        var tagId = $(this).attr('data-rtag-tagId');
        $('#deleteBtnModal').attr('data-rtag-recipeId', recipeId)
        $('#deleteBtnModal').attr('data-rtag-tagId', tagId)

        $('#tag-id').html(tagId)
        $('#recipe-id').html(recipeId)

        $('#delete-modal').modal('show');

    });

    $('#deleteBtnModal').on('click', function(){
        var recipeId = $(this).attr('data-rtag-recipeId');
        var tagId = $(this).attr('data-rtag-tagId');

        var data = {
            recipeId,
            tagId
        }

        $.post('/api/recipe-tag/delete', data, res => {
            $('#delete-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });

    });
    
});

function parseTagChanges(tags, oldTags) {
    var newTags = [];
    for(const tag of tags){
        if(oldTags.includes(tag) == false ) {
            newTags.push(tag);
        }
    }
    return newTags;
}

function addTagToContainer(tagId, tagName, disable){
    var tag = $('#tag-btn-clone').clone();
    tag.attr('id',tagId);
    tag.find('.tag-name').html(tagName)
    tag.removeClass('d-none');
    if(disable) {
        $(tag).find('.removeTagBtn').attr('disabled', 'disabled');
    }
    $('#tag-container').append(tag);
}

function getTags(){
    tagIds = [];
    $('#tag-container').children().each(function(){
        tagIds.push($(this).attr('id'));
    });
    return tagIds
}

function removeTag(e){
    console.log(e);
    $(e).parent().remove();
}