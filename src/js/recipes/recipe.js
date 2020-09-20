

$(document).ready(function(){
    $('.ingredient-link').click(function(){
        var id = $(this).attr("recipe-id");
        scrollToRecipe(id);
    });

});

//used in single reicpe page
function scrollToRecipe(id){
    var aTag = $("#" + id);
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
}