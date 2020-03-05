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


var $grid;
//#recipe-container
//.product-card

$('#recipe-container').on('load', function() {

})

$(document).ready(function(){
    //create the isotope grid
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
    
    $("#nav-bar-search-button").click(function(){
        searchCatalog($grid);
    });
    
    $("#collapsed-nav-bar-search-button").click(function(){
        searchCatalog($grid);
    })
    
    $("#collapsed-search-input").keyup(function(){
        console.log('Searching...');
        debounce(searchCatalog($grid), 200);
    })
    
    
    
    //used for testing at the moment
    $("#wishlist-button").click(function() {
        // - wishlist heart clicked.
        var user = firebase.auth().currentUser;
        console.log("User: ", user);
        console.log("toating..");
        
        $grid.isotope({ filter: '*' });
        
    });
    
    
    $("#sort-1").click(function() {    
        handleSortButtons('#sort-1');
        $grid.isotope({ 
            sortBy : 'name',
            sortAscending : true
        });
    });
    
    $("#sort-2").click(function() {
        handleSortButtons('#sort-2');
        $grid.isotope({ 
            sortBy : 'name',
            sortAscending : false
        });
    });
    
    $("#sort-3").click(function() {
        handleSortButtons('#sort-3');
        $grid.isotope({ sortBy : 'tags' });
    });
    
    //left side bar tag filtering
    $(".tag-filter").click(function() {
        if( $(this).hasClass("tag-view-all") ) {
            $grid.isotope({ filter: '*'})
        } else {
            var filter = ".tag-" + this.id;
            $grid.isotope({ filter: filter });
        }
    });
    
    // searching
    $('#recipe-search-input').keypress(function(event){
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            searchCatalog($grid);
        }
    });
    
    setTimeout(function(){ $('#sort-1').click() }, 250);
    
});

//variable holding all the filters we are using
var filterFns = {
  recipeName: function() {
    var name = $(this).attr('recipe-name');
    console.log($(this).attr('recipe-name'));
    return name.match( getSearchInput() );
  }
};

// -- Search the recipe catalog using the filter functions
function searchCatalog(grid){
    $("#no-results-div").hide();
    grid.isotope({ 
        filter: function() {
            var name = $(this).attr('recipe-name');
            var tags = $(this).attr('recipe-tags');
            var search = $('#recipe-search-input').val();
            var searchCollapsed = $('#collapsed-search-input').val();
            console.log("Search Collapsed: ", searchCollapsed)
            name = name.toUpperCase();
            tags = tags.toUpperCase();
            search = search.toUpperCase();
            searchCollapsed = searchCollapsed.toUpperCase();
            console.log("Search Collapsed: ", searchCollapsed)
            console.log("Search: ", search)
            if(search == null || search == undefined || search == "") {
                //the UI was probably collapsed
                search = searchCollapsed;
            }
            console.log("Search: ", search)
            return name.includes(search) || tags.includes(search)
        } 
    });
    
    noResultsCheck(grid)
    
}

function noResultsCheck($grid) {
    var elems = $grid.isotope('getFilteredItemElements')
    if (elems.length == 0) {
        //do something here, like turn on a div, or insert a msg with jQuery's .html() function
        $("#no-results-div").show();
    }
}

// debounce so filtering doesn't happen every millisecond
function debounce( fn, threshold ) {
  var timeout;
  threshold = threshold || 100;
  return function debounced() {
    clearTimeout( timeout );
    var args = arguments;
    var _this = this;
    function delayed() {
      fn.apply( _this, args );
    }
    timeout = setTimeout( delayed, threshold );
  };
}

function handleSortButtons(id) {
    $("#sort-1").removeClass('active');
    $("#sort-2").removeClass('active');
    $("#sort-3").removeClass('active');
    $(id).addClass('active');
}
