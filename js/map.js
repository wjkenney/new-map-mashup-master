// declares a global map variable
var map;

function createmap(list) {

    //this code was stolen from resume.
    function initializeMap() {
        var locations;
        var mapOptions = {
            disableDefaultUI: true
        };
        
        //creating the map
        map = new google.maps.Map(document.querySelector('#mapdiv'), mapOptions);

        //here we are going to put the flags in for each location in our list and resize the map accordingly
        for (element in list) {
            list[element].flagCreator(map)
        }
    }
    // Calls the initializeMap() function when the page loads
    window.addEventListener('load', initializeMap);

    // Vanilla JS way to listen for resizing of the window
    // and adjust map bounds
    window.addEventListener('resize', function(e) {

        //Make sure the map bounds get updated on page resize
        map.fitBounds(mapBounds);
    });
}