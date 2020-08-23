
var recipeId = '';
var imageCount = 0;
$(document).ready(function(){

    $('#recipeSelect').on('change', function(e) {
        console.log($(this).val())
        recipeId = $(this).val();
    });



});

Dropzone.options.uploadWidget = {
    url: '/api/upload/recipe-images',
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 2, // MB
    addRemoveLinks: true,
    removedfile: function(file) {
        console.log(file, ' was removed');
    },
    init: function() {
        this.on('success', function(file, resp){
            console.log(file);
            console.log(resp);
            imageCount += 1;
        });
        this.on('thumbnail', function(file) {
           if (file.accepted !== false) {
                if (file.width < 160 || file.height < 120) {
                    file.rejectDimensions();
                }
                else {
                    file.acceptDimensions();
                }
            }
        });
        this.on('sending', function(file) {

            file.recipeName = recipeId + "-" + (imageCount+1);
            console.log(file.recipeName);

        });
      },
    accept: function(file, done) {
        file.acceptDimensions = done;
        file.rejectDimensions = function() {
            done('The image must be at least 160px x 120px')
        };
      }
};