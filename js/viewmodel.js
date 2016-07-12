var citylist = [{
    "name": "The Louvre",
    "type": ["museum", "landmark"]
}, {
    "name": "The White House",
    "type": ["landmark"]
}, {
    "name": "The Gugenheim Museum",
    "type": ["museum"]
}, {
    "name": "Croke Park",
    "type": ["park"]
}, {
    "name": "Gran Paradiso Park",
    "type": ["park"]
}];

//we push site objects onto our list array.  This is what we are going to be manipulating in the program
var ViewModel = function() {
    var self = this;
    self.formvalue = ko.observable();
    self.warning = ko.observable('');

    self.filteredlist = ko.computed(function() {
        var fulllist = [];
        var newarray = [];
        citylist.forEach(function(location) {
            fulllist.push(location.name);
        });
        console.log(self.formvalue());
        if (self.formvalue() === undefined || self.formvalue() === "") {
            return fulllist;
        }

        for (var i = 0, len = citylist.length; i < len; i++) {
            fvalue = self.formvalue().toLowerCase();
            console.log(fvalue);
            if (fvalue == citylist[i].name.toLowerCase()) {
                newarray.push(citylist[i].name);
                return newarray;
            }
            for (var type in citylist[i].type) {
                newval = citylist[i].type[type];
                value = self.formvalue().toLowerCase();
                if (newval == value) {
                    newarray.push(citylist[i].name);
                }
            }
        }
        return newarray;
    });

    self.parisobservable = ko.observableArray([]);
    for (var i = 0, len = self.filteredlist().length; i < len; i++) {
        self.parisobservable.push(new Site(self.filteredlist()[i]));
    }
    //not sure this line is necessary, but just to make sure our map is only created once.
    if (map === undefined) {
        createmap(self.parisobservable());
    }

    self.idvalue = ko.observable('filtericon');
    self.icon = ko.observable('\uf0b0');

    // To make icon \ufobo disappear we have a hasfocus tag which toggles focus 'flag' from true to false.
    // this function is wrapped in a global click event function which tracks all click events on the page.
    //if focus is true onclick, the icon disappears. If it is false the icon appears.
    //When the submit button is pressed we don't want the icon to be inserted.
    //we have anther flag for the submit button which  'onclickdown' goes to true disabling the blur call 
    self.focus = ko.observable(false);
    self.iconflag = false;
    //here is out mousedown function
    self.md = function() {
        self.iconflag = true;
    };

    self.clickwrapper = function() {
        if (self.focus() === true) {
            self.warning('');
            self.idvalue('filter');
        } else if (self.iconflag === false) {
            if (self.formvalue() === undefined || self.formvalue() === '') {
                self.idvalue('filtericon');
            }
        }
        self.iconflag = false;

    };



    self.filter = function(map) {
        console.log(self.formvalue());
        self.focus(false)

        ;
        if (self.filteredlist().length === 0) {
            self.warning('please pick park, landmark or museum');
            return;
        }
        for (var element in self.parisobservable()) {
            self.parisobservable()[element].flag.setMap(null);
        }
        self.parisobservable.removeAll();
        for (var i = 0, len = self.filteredlist().length; i < len; i++) {
            self.parisobservable.push(new Site(self.filteredlist()[i]));
        }
        for (element in self.parisobservable()) {
            self.parisobservable()[element].flagCreator(map);
        }

    };
};

//ajax getting links from the NY times and putting it in a nice url list.   
var ajax = function(data, map) {
    $.ajax({
        url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + data.name + '&sort=newest&api-key=523f1c00610445ff960176f1c052eaaf',
        success: function(response) {
            listarray = [];
            var i = 0;

            if ($(window).width() > 780) {
                for (var element in response.response.docs) {
                    listarray[i] = "<li class='nytimes-container'><a href=" + response.response.docs[element].web_url + ">" + response.response.docs[element].headline.main + "</a></li>";
                    i++;
                }
            } else if ($(window).width() > 400) {
                for (var element in response.response.docs) {
                    truncatedarray = response.response.docs[element].headline.main.slice(0, 40);
                    if (response.response.docs[element].headline.main.length > 40) {
                        truncatedarray += "...";
                    }
                    listarray[i] = "<li class='nytimes-container'><a href=" + response.response.docs[element].web_url + ">" + truncatedarray + "</a></li>";
                    i++;
                }
            } else {
                for (var element in response.response.docs) {
                    if (i == 4) {
                        break;
                    }
                    try {
                        listarray[i] = "<li class='nytimes-container'><a href=" + response.response.docs[element].web_url + ">" + response.response.docs[element].keywords[0].value + "</a></li>";
                    } catch (err) {
                        listarray[i] = "<li class='nytimes-container'><a href=" + response.response.docs[element].web_url + ">" + 'Donald Trump' + "</a></li>";
                    }
                    i++;
                }

            }
            var liststring = "<ul id='nytimes-articles'>" + listarray.join('') + "</ul></div>";

            console.log(infoWindow);
            //data.infowindow is the this.infoWindow the Site object in our list array
            infoWindow.setContent(liststring);
            infoWindow.open(map, data.flag);
        },
        error: function() {
            alert("whoops ! something went wrong with ny times");
        }
    });
};



//These are the site objects that we are going to append to are knockout observable array and then post to the map.
var Site = function(city) {
    var self = this;
    self.name = city;
    self.flag;
    self.infoWindow;
};

Site.prototype.listClicker = function() {
    var self = this;
    for (element in vm.parisobservable()) {
        console.log(vm.parisobservable()[element])
    }
    self.flag.setAnimation(google.maps.Animation.BOUNCE);
    ajax(self, map);
    setTimeout(function() {
        self.flag.setAnimation(null);
    }, 3000);
};
//this map code was stolen from the resume project and then adapted for the assignment
Site.prototype.flagCreator = function(map) {
    var self = this;

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
            self.listClicker();
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
        };

        // Actually searches the Google Maps API for location data and runs the callback
        // function with the search results after each search.
        service.textSearch(request, callback);
    }

    // Sets the boundaries of the map based on pin locations
    window.mapBounds = new google.maps.LatLngBounds();

    // locations is an array of location strings returned from locationFinder()


    // pinPoster(locations) creates pins on the map for each location in
    pinPoster(self.name);
};




//here we are just addind a pointer to our viewmodel allowing us to access it from outside the viewmodel.  
var vm = new ViewModel();
ko.applyBindings(vm);