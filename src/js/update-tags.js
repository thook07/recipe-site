
$(document).ready(function(){
    console.log("loading tags....")
    $('#recipe-select-input').select2({
        theme: 'bootstrap4',
    });

    $("#recipe-select-input").change(function(){
        $("#update-tags-btn").prop("disabled", true);
    });
    
    $("#load-recipe-btn").click(function(e){
        e.stopPropagation();
        e.preventDefault();
        $("#update-tags-btn").prop("disabled", false);
        var recipeName = $( "#recipe-select-input option:selected" ).text();
        var recipeId = $( "#recipe-select-input option:selected" ).val();

        $("#recipe-name-tag").text(recipeName + " ("+recipeId+")");

        var recipeDiv = $("#" + recipeId);
        $(".tag-switch").each(function(){
            var tagId = $(this).attr("id");
            if(recipeDiv.hasClass(tagId)) {
                $(this).prop("checked", true);
            } else {
                $(this).prop("checked", false);
            }
        });

    
    });

    $("#update-tags-btn").click(function(e){
        e.stopPropagation();
        e.preventDefault();
        var recipeId = $( "#recipe-select-input option:selected" ).val();
        var tags = []
        $(".tag-switch").each(function(){
            if($(this).prop("checked") == true) {
                tags.push($(this).attr("id"));
            }
        });

        console.log("Update Recipe ["+recipeId+"]");
        console.log("Tags:", tags);

        var data = {};
        data["recipeId"] = recipeId;
        data["tags"] = tags;

        framework.post("http://3.14.147.18:1338/updateRecipeTags", data, function(res, err){
            if(err) {
                console.log("Error:",err)
            }
            console.log(res);   
        });

        

    });


    $("#create-tag-btn").click(function(e){
        e.stopPropagation();
        e.preventDefault();

        var id = $("#create-tag-id").val();
        var name = $("#create-tag-name").val();
        var category = $("#create-tag-category").val();

        if(id == "" || id == null || id == undefined) {
            console.log("Error. ID was null!");
            return;
        }

        var data = {
            "id": id,
            "name": name,
            "category": category
        }
    
        framework.post("http://3.14.147.18:1338/createTag", data, function(res, err){
            if(err) {
                console.log("Error:",err)
            }
            console.log(res);   
        });

        


    });
 

    


});
   
    