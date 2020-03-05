/*
   cr-recipe-name
   cr-recipe-url
   cr-recipe-ingredients
   cr-recipe-instructions
   cr-recipe-notes
   cr-recipe-prepTime
   cr-recipe-cookTime
   tag-switches
   cr-recipe-author
   cr-recipe-link-description
   cr-recipe-link
   cr-create-recipe-button








*/
var recipeId = "";
$(document).ready(function(){
   
    $( "#cr-form" ).on( "submit", function(e) {
        e.preventDefault();
        
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
        
        console.log(recipeIngredients);
        
        if( recipeIngredients == null ) {
            $("#cr-recipe-ingredients").addClass("is-invalid")
            setTimeout(() => {  $("#cr-form").removeClass('was-validated') }, 2);
            $('html, body').animate({ scrollTop: 0 }, 'fast');
            e.preventDefault()
            e.stopPropagation();
            return;
        } else {
            $("#cr-recipe-ingredients").removeClass("is-invalid");
            console.log(recipeIngredients);
        }

        var json = {
            'id': recipeId,
            'name': recipeName,
            'tags': recipeTags,
            'cookTime': recipeCookTime,
            'prepTime': recipePrepTime,
            'ingredients': recipeIngredients,
            'instructions': recipeInstructions,
            'notes': recipeNotes,
            'attribution': {
                'author': recipeAuthor,
                'link': recipeLink
            }
        }
        recipeRef = db.collection("recipes").doc(recipeId)
        recipeRef.set(json).then(function() {
            console.log("Recipe created successfully!");
            $('#toast-title').text('Success');
            $('#toast-body').text(recipeName + ' created successfully!');
            $('#generic-success-toast').toast('show');
            $('html, body').scrollTop(0);
            setTimeout(() => { location.reload(true); }, 500);
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
    });


    $('#cr-recipe-name').on('change', function(e){
        var recipeName = $('#cr-recipe-name').val();
        var id = buildRecipeId(recipeName);
        var recipeRef = db.collection('recipes').doc(id)

        recipeRef.get().then((docSnapshot) => {
            if (docSnapshot.exists) {
                recipeId = id + "-2"
                console.log('already existed: ' + recipeId)
            } else {
                recipeId = id;
                console.log('after check: ' + recipeId)
            }
        });
        
        console.log('on change: ' + recipeId);
    
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
        var ingredient = array[i].replace(new RegExp('-','g'),'|')
        var strArray = ingredient.split('|');
        var amount = strArray[0];
        var ingredient = strArray[1];
        if(amount == null || amount == undefined || ingredient == null || ingredient == undefined) {
            return null;
        }
        jsonObj.push({ "amount": amount.trim(), "ingredient": ingredient.trim()});
    }
    return jsonObj;
}

function buildRecipeId(name){
    var nameStr = "";
    if(name == null || name == "") {
        return "";
    }
    var nameStr = name.replace(new RegExp(' ', 'g'),"-");
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
