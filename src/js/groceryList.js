$(document).ready(function(){
   
    $(".grocery-item").click(function(){
        
        var id = $(this).attr("data-check");
        $("#"+id).toggleClass("d-none");
        $(this).toggleClass("list-group-item-dark");
        
        
    });
    
    
});
