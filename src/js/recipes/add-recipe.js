
var recipeId = "";
let recipeIds = [];
$(document).ready(function(){

    $.get( '/api/recipes/id', function( data ) {
        recipeIds = data;
    });
    
    $( "#cr-form" ).on( "submit", function(e) {
        e.preventDefault();
        
        var recipeId = $('#cr-recipe-id').val();
        var recipeName = $('#cr-recipe-name').val();
        var recipeIngredients = $('#cr-recipe-ingredients').val();
        var recipeInstructions = $('#cr-recipe-instructions').val();
        var recipeNotes = $('#cr-recipe-notes').val();
        var recipePrepTime = $('#cr-recipe-prepTime').val();
        var recipeCookTime = $('#cr-recipe-cookTime').val();
        var recipeAuthor = $('#cr-recipe-author').val();
        var recipeLink = $('#cr-recipe-link').val();
        
        recipeIngredients = parseAndValidateIngredients(recipeIngredients);
        recipeInstructions = parseTextAreaIntoArray(recipeInstructions);
        recipeNotes = parseTextAreaIntoArray(recipeNotes);
        var recipeTags = getTags();
        
        if ($('#cr-form')[0].checkValidity() === false) {
            e.preventDefault()
            e.stopPropagation();
            $('html, body').animate({ scrollTop: 0 }, 'fast');
            return;
        } 

        
        if( recipeIngredients == null ) {
            $("#cr-recipe-ingredients").addClass("is-invalid")
            setTimeout(() => {  $("#cr-form").removeClass('was-validated') }, 2);
            $('html, body').animate({ scrollTop: 0 }, 'fast');
            e.preventDefault()
            e.stopPropagation();
            return;
        } else {
            $("#cr-recipe-ingredients").removeClass("is-invalid");
        }
        
        var recipe = {
            'id': recipeId,
            'name': recipeName,
            'tags': recipeTags,
            'cookTime': recipeCookTime,
            'prepTime': recipePrepTime,
            'recipeIngredients': recipeIngredients,
            'instructions': recipeInstructions,
            'attAuthor' : recipeAuthor,
            'attLink' : recipeLink
        }

        if(recipeNotes != undefined) recipe['notes'] = recipeNotes;
            
        var data = {};
        data['recipe'] = recipe;

        console.log(data);
        
        /* Send to API */
        $.post( '/api/recipes/add', data, res => {
            $('#toast-title').text('Success');
            $('#toast-body').text(recipeName + ' created successfully!');
            $('#generic-success-toast').toast('show');
            $('html, body').scrollTop(0);
            setTimeout(() => { location.reload(true); }, 500);
        }).fail(err => {
            console.log(err.responseText)
        });     
    });


    $('#cr-recipe-name').on('change', function(e){
        var recipeName = $('#cr-recipe-name').val();
        const id = validateAndCreateRecipeId(recipeName,1);
        console.log("FINAL ID: " + id)
        $('#cr-recipe-id').val(id);
        $('#recipe-id-placeholder').attr('data-original-title','RecipeId: ' + id)
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

        var tag = $('#tag-btn-clone').clone();
        tag.attr('id',tagId);
        tag.find('.tag-name').html(tagName)
        tag.removeClass('d-none');
        $('#tag-container').append(tag);
    });

    $('.removeTagBtn').on('click', function(){
        $(this).parent().remove();
    });
    
});

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


function parseTextAreaIntoArray(rawText) {
    var array = rawText.split(/\r?\n/);
    var jsonObj = []
    for (var i = 0; i < array.length; i++) {
        if( array[i] != "" ) {
            jsonObj.push(array[i]);
        }
    }
    return jsonObj;
}

function parseAndValidateIngredients(rawText) {
    var array = rawText.split(/\r?\n/);
    var jsonObj = []
    for (var i = 0; i < array.length; i++) {
        if( array[i] == "" ) {
            continue;
        }
        var strArray = array[i].split('-');
        var amount = strArray[0];
        strArray.shift();
        var ingredient = strArray.join().replace(/,/g,"-");

        if(amount == null || amount == undefined || ingredient == null || ingredient == undefined) {
            return null;
        }
        var ri = {};
        ri.amount = amount.trim();
        ri.ingredientDescription = ingredient.trim();
        ri.isRecipe = 0;

        jsonObj.push(ri);
    }
    return jsonObj;
}

function validateAndCreateRecipeId(name, index){
    console.log("validateAndCreateRecipeId:", name, index);
    var id;
    if( index <= 1 ) {
        //first time
        id = generateRecipeId(name);
    } else {
        id = generateRecipeId(name + "-" + index.toString()); 
    }

    if( recipeIds.includes(id) ) {
        console.log(id + ' already existed. Retrying.')
        return validateAndCreateRecipeId(name, index + 1);
    } else {
        console.log("Success. Found Available RecipeId: " + id)
        return id;
    }
    
}

function generateRecipeId(name) {  
    var nameStr = "";
    if(name == null || name == "") {
        return "";
    }
    var nameStr = name.trim().replace(new RegExp(' ', 'g'),"-");
    nameStr = nameStr.replace(/[^a-zA-Z0-9-_]/g, ''); //remove anything that wont be put in a url
    
    var url = nameStr.toLowerCase();
    url = url.replace(new RegExp('---', 'g'),"-");
    
    return url;
}

//no longer required.
function parseTagsIntoJson() {
    var recipeTags = []
    $( ".tag-switches:checked" ).each(function(key, value) {
        recipeTags.push(value.id);
    });
    return recipeTags;
}
