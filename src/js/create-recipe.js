
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
        var recipeTags = parseTagsIntoJson();
        
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
        
        var json = {
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

        if(recipeNotes != undefined) json['notes'] = recipeNotes;
            
        var data = {};
        data['recipe'] = json;
        
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
        var id = validateAndCreateRecipeId(recipeName,1);
        $('#cr-recipe-id').val(id);
    });
    
});


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

    console.log(recipeIds[0])
    if( recipeIds.includes(id) ) {
        console.log(id + ' already existed. Retrying.')
        validateAndCreateRecipeId(name, index + 1);
    } else {
        console.log("Success. Found Available RecipeId: " + id)
        return id;
    }
    
    /*var recipeRef = db.collection('recipes').doc(id);
    
    recipeRef.get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            console.log(recipeId, ' already existed. Lets try again...');
            validateAndCreateRecipeId(name, index + 1);
        } else {
            console.log('Found Unique Recipe Id:' + id);
            recipeId = id;
        }
    });*/
    
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

function parseTagsIntoJson() {
    var recipeTags = []
    $( ".tag-switches:checked" ).each(function(key, value) {
        recipeTags.push(value.id);
    });
    return recipeTags;
}
