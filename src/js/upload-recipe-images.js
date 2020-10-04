
//used to name the image being uploaded.
var recipeId = '';
var imageCount = 0;

$(document).ready(function(){

    //enable the sorting of the images
    $( "#sortable" ).sortable();

    //whenever the recipe gets selected
    $('#recipeSelect').on('change', async function(e) {
        loadUploadWidget($('#recipeSelect').val());
    });

    $('#refresh-recipe-images-btn').on('click', function(e) {
        loadUploadWidget($('#recipeSelect').val());
    });

    //post the update TODO: disable until ready. 
    $('#update-recipe-images-btn').on('click', function(e) {
        imagePaths = [];
        $('#sortable').children().each(function() {
            console.log($(this))
            imagePaths.push($(this).find('span .imagespan').html());
        });

        var data = {
            attributes: {
                images: imagePaths
            }
        }
        console.log(data);

        $.post( '/api/recipes/'+$('#recipeSelect').val()+'/update', data, res => {
            console.log('Success!');
            $('#toast-title').text('Success');
            $('#toast-body').text($('#recipeSelect').val() + ' updated successfully!');
            $('#generic-success-toast').toast('show');
        }).fail(err => {
            console.log(err.responseText)
        });        

    });

});

//loads the images if exists
async function loadUploadWidget(recipeId){
    recipeId = $('#recipeSelect').val();
    console.log('RECIPE ID SET: ' + recipeId);
    var images = await $.get( '/api/recipes/'+recipeId+'/images');
    $( '#sortable' ).empty();
    if(images.length > 0) {
        imageCount = images.length
        images.forEach(image => {
            $('#sortable').append(buildListItem(image));
        });
    } else {
        console.log("No Images Available");
    }
    $('#upload-widget').removeClass('d-none')
    $('#sortable').sortable( 'refresh');
}

//placed on the hidden template LI (stored on the DIV)
function removeButtonClicked(btn) {
   $(btn).parent().remove();
}

//builds the list item and appends it to the list
function buildListItem(imgPath) {
    var li = $('#img-template').clone()
    var ul = $('#sortable');
    console.log( li.find('span').find('img').html() );
    var img = li.find('.imagesrc');
    img.attr('src', imgPath)
    img.removeClass('imagesrc');
    
    li.find('span .imagespan').html(imgPath)
    return li.html();
}

//initializes the dropzone for uploading of images
//TODO: remove and delete images
Dropzone.options.uploadWidget = {
    url: '/api/upload/recipe-images',
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 2, // MB
    addRemoveLinks: true,
    removedfile: function(file) {
        console.log(file, ' was removed');
        //TODO: remove the file.
    },
    renameFile: function (file) {
        fileName = file.name
        var suffix = fileName.substring(fileName.indexOf("."),fileName.length);
        let newName = $('#recipeSelect').val() + '-' + (imageCount+1) + suffix;
        console.log('New Name: ['+newName+']')
        imageCount += 1;
        return newName;
    },
    init: function() {
        this.on('success', function(file, resp){
            console.log(file);
            console.log(resp);
            var path = resp.data.path;
            console.log(path);
            $('#sortable').append(buildListItem(path));
            $('#sortable').sortable( 'refresh');
        });
        this.on('thumbnail', function(file) {
           if (file.accepted !== false) {
                if (file.width < 518 || file.height < 484) {
                    file.rejectDimensions();
                }
                else {
                    file.acceptDimensions();
                }
            }
        });
      },
    accept: function(file, done) {
        file.acceptDimensions = done;
        file.rejectDimensions = function() {
            done('The image must be 518px x 484px')
        };
      }
};