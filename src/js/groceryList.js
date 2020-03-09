var showChecked = true;
$(document).ready(function(){
   
    
    $(".grocery-item").click(function(){
        console.log("Show Checked [",showChecked,"]")
        var idCheck = $(this).attr("data-check");
        var id = $(this).attr("data-text");
        $("#"+idCheck).toggleClass("d-none");
        $(this).toggleClass("list-group-item-dark");
        $(this).toggleClass("checked");
        
        console.log('testig...', !showChecked, $(this).hasClass("checked"), $(this).hasClass("checked") && showChecked == false)
        if($(this).hasClass("checked") && !showChecked) {
            $(".checked").hide();
        }
        

        if ( $("#"+id).parent().is( "del" ) ) {
            $("#"+id).unwrap();
        } else {
            $("#"+id).wrap( "<del></del>" );
        }
        
    });
    
    $("#hide-checked").click(function(){
        showChecked = false;
        $(".checked").hide();
        $("#hide-checked").addClass("btn-primary");
        $("#hide-checked").removeClass("btn-outline-primary");
        $("#show-checked").removeClass("btn-primary");
        $("#show-checked").addClass("btn-outline-primary");
    });
    
    $("#show-checked").click(function(){
        showChecked = true;
        $(".checked").show();
        $("#hide-checked").addClass("btn-outline-primary");
        $("#hide-checked").removeClass("btn-primary");
        $("#show-checked").addClass("btn-primary");
        $("#show-checked").removeClass("btn-outline-primary");
    });
    
    
    
});
