 var citylist=["the Louvre", "The White House", "The Gugenheim Museum"]

var ViewModel=function(){
	console.log(map)
    var self=this;
	this.parisobservable=ko.observableArray([])
	for (i=0, len=citylist.length; i<len;i++){
		self.parisobservable.push(new Site(i))
	}
        if (map==undefined){
        createmap(self.parisobservable());
     }  
    

    //this.remoteFlagFunction{
        //find the right Site object to manipulate
        //run ajax function using the site as input.  

    //this.filter. 
        //we will change our data to reflect different fields, (parks, monuments, and museums)
        //based on the filter options we will remove the fields no longer wanted
        //we will rerun flag creater
        //flag creator will need to destroy existing flags and then build them up again. Maybe a this.flagDestroyer in Site
}	

var ajax= function(data, map){
        $.ajax({
            url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q='+ data.name()+'&sort=newest&api-key=523f1c00610445ff960176f1c052eaaf', 
            success: function(response){
                listarray=[];
                i=0;
                for (element in response.response.docs){
                    listarray[i]="<li class='nytimes-container'><a href="+response.response.docs[element].web_url+">"+response.response.docs[element].headline.main+"</a></li>";
                    i++;
                }
                liststring="<ul id='nytimes-articles'>"+listarray.join('')+"</ul></div>";
                data.infoWindow = new google.maps.InfoWindow({
                    content: liststring
            });   
                data.infoWindow.open(map, data.flag)  
            },
            error : function(){  
                alert("whoops ! something went wrng with ny times")
            }
        })
    }

var Site=function(index){
	var self= this;
	this.name=ko.observable(citylist[index])
    this.flag;
    this.infoWindow;

	
    this.flagCreator= function(map){
        console.log(map)
        function createMapMarker(placeData) {

        // The next lines save location data from the search result object to local variables
            var lat = placeData.geometry.location.lat();  // latitude from the place service
            var lon = placeData.geometry.location.lng();  // longitude from the place service
            var name = placeData.formatted_address;   // name of the place from the place service
            var bounds = window.mapBounds;            // current boundaries of the map window
            // marker is an object with additional data about the pin for a single location
            self.flag = new google.maps.Marker({
                map: map,
                position: placeData.geometry.location,
                title: name
            });

    // infoWindows are the little helper windows that open when you click
    // or hover over a pin on a map. They usually contain more information
    // about a location.
            // hmmmm, I wonder what this is about...
            google.maps.event.addListener(self.flag, 'click', function() {
                ajax(self, map)
            });

    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
            bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
            map.fitBounds(bounds);
    // center the map
            map.setCenter(bounds.getCenter());
        }

  /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
        function callback(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                 createMapMarker(results[0]);
                }
            }
  /*
  pinPoster(locations) takes in the array of locations created by locationFinder()
  and fires off Google place searches for each location
  */
        function pinPoster(name) {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
            var service = new google.maps.places.PlacesService(map);
    // Iterates through the array of locations, creates a search object for each location
            
      // the search request object
            var request = {
                query: name
            }
        
      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
            service.textSearch(request, callback);
        }

  // Sets the boundaries of the map based on pin locations
        window.mapBounds = new google.maps.LatLngBounds();

  // locations is an array of location strings returned from locationFinder()
  

  // pinPoster(locations) creates pins on the map for each location in
        pinPoster(self.name());
        }

    }
       


    ko.applyBindings(new ViewModel());

