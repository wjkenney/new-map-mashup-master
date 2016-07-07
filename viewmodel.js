var citylist = [{
     "the Louvre": ["museum", 'landmark']
 }, {
     "The White House": ["landmark"]
 }, {
     "The Gugenheim Museum": ["museum"]
 }, {
     "Croke Park": ["park"]
 }, {
     'Gran Paradiso Park': ['park']
 }]

 //we push site objects onto our list array.  This is what we are going to be manipulating in the program
 var ViewModel = function() {
     var self = this;
     this.parisobservable = ko.observableArray([]);
     for (i = 0, len = citylist.length; i < len; i++) {
         self.parisobservable.push(new Site(Object.keys(citylist[i])));
     };
     //not sure this line is necessary, but just to make sure our map is only created once.
     if (map == undefined) {
         createmap(self.parisobservable());
     }

     this.idvalue = ko.observable('filtericon');
     this.formvalue = ko.observable('\uf0b0');

     //if there is a warning message we remove it and we get rid of the fliter icon and psuh margins left.  
     this.focus = function() {
         $('.warning').remove();
         self.formvalue('');
         self.idvalue('filter');
     }


     //we will change our data to reflect different fields, (parks, monuments, and museums)
     //we will delete all fields
     //we will rerun flag creater with new filtered list 
     this.filter = function(map) {
         value = document.getElementById('filter').value;
         filteredlist = [];
         citylist.forEach(function(obj) {
             for (key in obj) {
                 newval = obj[key];
                 newval.forEach(function(type) {
                     value = value.toLowerCase();
                     if (type == value) {
                         filteredlist.push(Object.keys(obj));
                     }
                 })
             }
         })
         //User gets a message should they mistype search query
         if (filteredlist.length == 0) {
             $('#filter-form').append('<div class="warning">please pick park, landmark or museum</div>');
             return;
         }

         for (element in self.parisobservable()) {
             self.parisobservable()[element].flag.setMap(null);
         }
         self.parisobservable.removeAll();
         for (i = 0, len = filteredlist.length; i < len; i++) {
             self.parisobservable.push(new Site(filteredlist[i][0]));
         }
         for (element in self.parisobservable()) {
             self.parisobservable()[element].flagCreator(map);
         }
     }

 }

 //this code is necessary because the blur event was triggering when the filtersubmit button was pressed which in turn caused the icon to come back which 
 //cause the search query to break.  We are accessing the vewmodel through the vm pointer   
 $(".submitclass").on('blur', function(e) {
    if (document.getElementById('filter').value==""){
        if ($("#filter-submit").data("mouseDown") != true) {
            vm.idvalue('filtericon');
            vm.formvalue('\uf0b0');
        }
    }
 });

 $("#filter-submit").on("mousedown", function(e) {
     $("#filter-submit").data("mouseDown", true);
 });

 $("#filter-submit").on("mouseup", function(e) {
     $("#submit").data("mouseDown", false);
 });




 //ajax getting links from the NY times and putting it in a nice url list.   
 var ajax = function(data, map) {
     $.ajax({
         url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + data.name + '&sort=newest&api-key=523f1c00610445ff960176f1c052eaaf',
         success: function(response) {
             listarray = [];
             i = 0;
             for (element in response.response.docs) {
                 listarray[i] = "<li class='nytimes-container'><a href=" + response.response.docs[element].web_url + ">" + response.response.docs[element].headline.main + "</a></li>";
                 i++;
             }
             liststring = "<ul id='nytimes-articles'>" + listarray.join('') + "</ul></div>";
             //data.infowindow is the this.infoWindow the Site object in our list array
             data.infoWindow = new google.maps.InfoWindow({
                 content: liststring
             });
             data.infoWindow.open(map, data.flag);
         },
         error: function() {
             alert("whoops ! something went wrng with ny times");
         }
     })
 }



 //These are the site objects that we are going to append to are knockout observable array and then post to the map.
 var Site = function(city) {
     var self = this;
     this.name = city;
     this.flag;
     this.infoWindow;
     this.listClicker = function() {
         ajax(this, map);
     }

     //this map code was stolen from the resume project and then adapted for the assignment
     this.flagCreator = function(map) {
         function createMapMarker(placeData) {

             // The next lines save location data from the search result object to local variables
             var lat = placeData.geometry.location.lat(); // latitude from the place service
             var lon = placeData.geometry.location.lng(); // longitude from the place service
             var name = placeData.formatted_address; // name of the place from the place service
             var bounds = window.mapBounds; // current boundaries of the map window
             // marker is an object with additional data about the pin for a single location, we are putting the data in our self.flag
             self.flag = new google.maps.Marker({
                 map: map,
                 position: placeData.geometry.location,
                 title: name
             });

             //here we have the event listener for the triggering out ajax call.  
             google.maps.event.addListener(self.flag, 'click', function() {
                 ajax(self, map);
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
         pinPoster(self.name);
     }

 }

 //here we are just addind a pointer to our viewmodel allowing us to access it from outside the viewmodel.  
 var vm = new ViewModel()
 ko.applyBindings(vm);