var citylist=["the Louvre", "Invalides", "Eiffel Tower"]

var ViewModel=function(){
	var self=this;
	this.parisobservable=ko.observableArray([])
	for (i=0, len=citylist.length; i<len;i++){
		self.parisobservable.push(new Site(i))
		console.log(self.parisobservable()[i].name());
	}
    createmap(self.parisobservable());
}	

var Site=function(index){
	var self= this;
	this.name=ko.observable(citylist[index])

	this.ajax= function(){
    	$.ajax({
            url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q='+ self.name()+'&sort=newest&api-key=523f1c00610445ff960176f1c052eaaf', 
            success: function(response){
                listarray=[];
                i=0;
                for (element in response.response.docs){
                    listarray[i]="<li class='nytimes-container'><a href="+response.response.docs[element].web_url+">"+response.response.docs[element].headline.main+"</a><p>"+response.response.docs[element].snippet+"</li></p>";
                    i++;
                }
                liststring="<ul id='nytimes-articles'>"+listarray.join()+"</ul></div>";
                articlestart=  "<div class='nytimes-container'><h3 id='nytimes-header'>New York Times Articles</h3>"
                $('body').append(articlestart+liststring);
            },
            error : function(){  
                alert("whoops ! something went wrng with ny times")
            }
        })
    }
       
}

ko.applyBindings(new ViewModel());

