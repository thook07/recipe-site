
$(document).ready(function(){

    $('#filterBtn').on('click', function(){
        if( $("#q").val() != '') {
            document.location.href = "/admin/recipes?q=" + $("#q").val();
        } else if( $("#select-recipe-id").val() != 'Select Recipe...') {
            document.location.href = "/admin/recipes?r=" + $("#select-recipe-id").val();
        }
    })

    $('.editBtn').on('click', function(){
        var data = $(this).attr('data-recipe');
        data = JSON.parse(data);
        
        $("#text-id").val(data.id)
        $("#text-name").val(data.name)
        $("#text-recipeIngredients").attr('rows',data.recipeIngredients.length);
        $("#text-recipeIngredients").val(convertToCSV(data.recipeIngredients, true));
        if( data.instructions ) {
            $("#text-instructions").attr('rows',data.instructions.length+5);
            $("#text-instructions").val(convertToCSV(data.instructions, false));
        }
        if( data.notes ) {
            $("#text-notes").attr('rows',data.notes.length);
            $("#text-notes").val(convertToCSV(data.notes, false));
        }
        if( data.images ) {
            $("#text-images").attr('rows',data.notes.length);
            $("#text-images").val(convertToCSV(data.images, false));
        }
        $("#text-author").val(data.attAuthor)
        $("#text-link").val(data.attLink)
        $("#text-cookTime").val(data.cookTime)
        $("#text-prepTime").val(data.prepTime)
        
        $('#update-modal').modal('show');

    });

    $('#update-btn').on('click', function(){
        var data = {
            attributes: {
                name: $('#text-name').val(),
                attAuthor: $('#text-author').val(),
                attLink: $('#text-link').val(),
                cookTime: $('#text-cookTime').val(),
                prepTime: $('#text-prepTime').val(),
                recipeIngredients: convertFromCSV($("#text-recipeIngredients").val(), true),
                notes: convertFromCSV($("#text-notes").val(), false),
                instructions: convertFromCSV($("#text-instructions").val(), false),
                images: convertFromCSV($("#text-images").val(), false)
            },
            removeIngredientIds: $("#cb-removeIngredientIds").is(":checked"),
            recipeId: $('#text-id').val()
        }
        
        $.post('/api/recipes/'+data.recipeId+'/update', data, res => {
            $('#update-modal').modal('hide');
            location.reload();
        }).fail(err => {
            console.log(err);
        });
    })
    
});

function convertToCSV(arr, isRi) {
    //format is as follows:
    //id, amount, ingredientDescription
    var text = '';
    if( isRi ) {
        for(const ri of arr) {
            text += ri.id + ';' + ri.amount + ';' + ri.ingredientDescription + '\n';
        }
    } else {
        for(const item of arr) {
            text += item + '\n';
        }
    }
    return text.trim();
}

function convertFromCSV(string, isRi) {
    var arr = []
    if( isRi ){ 
        for(const row of string.split('\n')) {
            //this row should be ID;Amount;IngredientDesc
            if( row == "") {
                continue;
            }
            rawRIData = row.split(';');
            if(rawRIData.length != 3 ) {
                throw "Invalid RecipeIngredient data"
            }
            var id = (rawRIData[0] == "" ? undefined : rawRIData[0]) 
            var ri = {
                id: id,
                amount: rawRIData[1],
                ingredientDescription: rawRIData[2]
            }
            arr.push(ri);
        }
    } else {
        for(const row of string.split('\n')) {
            if( row == "") {
                continue;
            }
            arr.push(row);
        }
    }

    return arr;

}