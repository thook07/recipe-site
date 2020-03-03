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
        $('#recipe-search-input').text(suggestion);
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
    
    var $grid = $('#recipe-container').isotope({
        // options
        itemSelector: '.recipe-card',
        percentPosition: true,
        masonry: {
            columnWidth: '.grid-sizer'
        },
        getSortData: {
            name: '[recipe-name]', // value of attribute
            tags: '[recipe-tags]', // value of attribute
            description: '[recipe-description]', // value of attribute
           
        }
    });
    
    $("#wishlist-button").click(function() {
        // - wishlist heart clicked.
        var user = firebase.auth().currentUser;
        console.log("User: ", user);
        console.log("toating..");
        
        $grid.isotope({ filter: '*' });
        
    });
    
    $("#sort-1").click(function() {
        $grid.isotope({ 
            sortBy : 'name',
            sortAscending : true
        });
    });
    
    $("#sort-2").click(function() {
        $grid.isotope({ 
            sortBy : 'name',
            sortAscending : false
        });
    });
    
    $("#sort-3").click(function() {
        $grid.isotope({ sortBy : 'tags' });
    });
    
    $(".tag-filter").click(function() {
        console.log("Filtering on tag-" + this.id);
        var filter = ".tag-" + this.id;
        
        $grid.isotope({ filter: filter });

        

    });
    
});
