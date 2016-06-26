var map;
function createmap(list){

     // declares a global map variable

/*
Start here! initializeMap() is called when page is loaded.
*/
  function initializeMap() {

    var locations;

    var mapOptions = {
      disableDefaultUI: true,
    };
  
  //locationFinder() returns an array of every location string from the JSONs
  //written for bio, education, and work.
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);
    console.log(map);
  /*
  locationFinder() returns an array of every location string from the JSONs
  written for bio, education, and work.
  */

    for (element in list){
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

