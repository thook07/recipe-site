var countries = [
    { value: 'Nourish Bowls', data: 'AD' },
    { value: 'Pumpkin Mini Muffins', data: 'ZZ' },
    { value: 'Taco Chili', data: 'ZZ' },
    { value: 'Jalapeno Mac and Cheese', data: 'ZZ' },
    { value: 'Energy Balls - Oatmeal Raisen', data: 'ZZ' },
];

$('#recipe-search-input').autocomplete({
    lookup: countries,
    onSelect: function (suggestion) {
        alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
    }
});



//#recipe-container
//.product-card
$(document).ready(function(){
    $('#recipe-search-input').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            var value = $(this).val().toLowerCase();
            $('#recipe-container').children('.recipe-card').each(function () {
                var tags = $(this).attr("recipe-tags");
                var name = $(this).attr("recipe-name");
                if(tags.includes(value) || name.includes(value)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }
    });
    
});
