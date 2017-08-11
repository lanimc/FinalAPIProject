var app = {
	initialize: function() {
		app.getSearchTerm();
        
	},

    getSearchTerm: function() {
        $('#submitSearch').click(function(){
        
            //Clear any previous search results 
            $('.beers').html('');
            $('.food').html('');
            $('.draw').html('');

            //Get the input box value
            var userTerm = $('#inputBox').val();
            console.log('beer term:\n',userTerm);

            //run the api call with the beerTerm
            app.getBeerData(userTerm);
        })
        
    },
    
    //api call to beer api
    getBeerData: function(Term) {
		console.log("Beers API Call");

		var BeerURL = "http://api.brewerydb.com/v2/search?key=";
		var myBeerAPIKey = "adc1e562bb00337ee44e0dcf23cfefcc";
        var SearchParam = "&q="+Term+"&type=beer&withIngredients=Y"
		var BeerReqURL = BeerURL + myBeerAPIKey+SearchParam;
        
		$.ajax({
			url: BeerReqURL,
			type: 'GET',
			dataType: 'json',
			
            error: function(err){
				console.log(err);
			},
			
            success: function(data){
                var htmlString = "<h3>No " + Term + " beers found</h3>"
                if(data.data == null) { $('.beers').append(htmlString);}
                else{
                htmlString = "<h3>" + data.data.length+ " " +Term + " beers found</h3>"
                $('.beers').append(htmlString)
                
                //add the circles 
                app.drawBeerData(data.data);
                
                }
                
			}
            
            
		});
	},
    drawBeerData: function(theBeers){
        console.log("Draw Beer Data:\n",theBeers);    
        
        //set default values 
        var beername = "Not Available";
        var beerstyledesc = "Not Available"
        var beerstylename = "Not Available";
        var beerdesc = "Not Available";
        var label = "beercloseup.jpg";
                
                
        //set up d3 visualization
        var width = $(window).width();
        var height = 350;
        
        var svg = d3.select(".draw").append("svg").attr("width",width).attr("height",height);
        
        var simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-4).distanceMax([70]))
            .force("center", d3.forceCenter(width / 2, height / 2));
    
        simulation
            .nodes(theBeers)
            .on("tick", ticked);

        var g = svg.selectAll("g")
            .data(theBeers, function(d,i) { return i; })
        
    
        
        var node = g.enter().append("svg:g")
            .attr("class", "nodes")
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));
            
        
        
        // Append a circle
        //node.append("svg:circle")
           // .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; });
        
        node.append("image")
            .attr("xlink:href",  function(d) { var cimage; if(d.labels && d.labels.icon){cimage = d.labels.icon} else{ cimage = label}; return cimage})
            .attr("height", 35)
            .attr("width", 35);
        
        node.append("clipPath")
            .attr("id", function(d,i) { return "clip-" + d.name+i; })
            .append("use")
            .attr("xlink:href", function(d) { return "#" + d.name; });
        
        node.append("title")
            .text(function(d) { return d.name ;});
        
        node.on("click", function(d,i) {d3.select( this ).attr("class","node sel");
            if(d.name){beername = d.name.toUpperCase()};
                                        if(d.description){beerdesc = d.description}; 
                                        if(d.style && d.style.name) {beerstylename = d.style.name.toUpperCase()}
                                        if(d.stlye && d.style.description){beerstyledesc=d.style.description};
                                        if(d.labels && d.labels.icon){label = d.labels.icon}
                            $('.draw svg text').html('');$('.searchResults h1').html(''); $('.searchResults h2').html(''); $('.searchResults p').html('');
                            //$(".searchResults h1").html(beername);
                            $(".beers h2").html(beerstylename);
                            $(".beers p").html(d.description + "<br>" + d.style.description);
                            d3.select(".draw svg").append("text").text(beername).attr("transform","translate(0,20)");
                                                    });
        
        
        
                                    
        node.on("dblclick",function(d) { 
            
            $('.food').html('');  app.parseBeerData(d.style.description);});
        
      
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.6).restart();
            d.fx = d.x;
            d.fy = d.y;
            }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        

        function ticked() {
        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
         
  }
        
    },
    parseBeerData: function(Desc) {
            console.log("ParseBeerData:\n", Desc);
            var beerdata = Desc;
        
        
            //Get the input box value - use text razor api to parse beer description and compare it to ingredient list of food
            $.ajax({
                url: "https://api.textrazor.com/",
                type: "POST",
                dataType: 'json',
                headers: {
                    'x-textrazor-key': "0d9c0c5f4809be708351bebc37eb4293ee105eda57471968947c88ea"
                },
                data: { 
                    extractors: "entities,words",
                    text: "'"+beerdata+"'",
                    type: ['/food/ingredient']
                },
    
                error: function (xhr) {
                    console.error(xhr.responseText);
                },
   
                success: function (fooddata) {
                    console.log('textrazor data:\n',fooddata);
                    
                    var foodresponse = fooddata.response;
                    var beerTerms = [];
                    var minconf = _.min(_.pluck(foodresponse.entities,"confidenceScore"));console.log(minconf);
                    var maxconf = _.max(_.pluck(foodresponse.entities,"confidenceScore"));console.log(maxconf);
                    var minrela = _.min(_.pluck(foodresponse.entities,"relevanceScore"));console.log(minrela);
                    var maxrela = _.max(_.pluck(foodresponse.entities,"relevanceScore"));console.log(maxrela);
                    for (var i=0; i<foodresponse.entities.length; i++){
                        if (foodresponse.entities){
                            if(foodresponse.entities[i].confidenceScore && foodresponse.entities[i].confidenceScore >=minconf+((maxconf-minconf)/2) && foodresponse.entities[i].relevanceScore && foodresponse.entities[i].relevanceScore > minrela+((maxrela-minrela)/2) ){
                                
                                beerTerms.push(foodresponse.entities[i].matchedText.toLowerCase());
                                
                            }
                        }
                    }
                    
                    

                    //run the yummly api call with the beerTerm
                    beerTerms = _.unique(beerTerms).join("&allowedIngredient[]=");
                    console.log('unique beerTerms:\n',beerTerms);
                     
                    app.getFoodData(beerTerms);
                   
                }
            });
 
        
        
    },
    
    
    getFoodData: function(BeerTerms) {
		console.log("Food API call");
        
        //use the textrazor data in the yummly api
		var YumURL = "http://api.yummly.com/v1/api/recipes?";
        var myYummlyAPIID = "_app_id=209f537e";
		var myYummlyAPIKey = "&_app_key=278352a846671c55c698496348b32ffb";
        
        //every recipe has to match the search phrase and satisfy the ingredient, cuisine, course, holiday, time, nutrition, and taste restrictions
        var SearchParam = "&allowedIngredient[]="+ BeerTerms +"&requirePictures=true&allowedCourse[]=course^course-Desserts"
		var YumReqURL = YumURL + myYummlyAPIID + myYummlyAPIKey + SearchParam;
        
        console.log('yummly api url:\n',YumReqURL);
        
		$.ajax({
			url: YumReqURL,
			type: 'GET',
			dataType: 'json',
			
            error: function (xhr) {
                    console.error(xhr.responseText);
            },
			

            success: function(data){
            console.log("Got the desserts:\n", data.matches);
            var htmlString = "<h3>No related desserts found</h3>"
                if(data.matches == null) { $('.food').append(htmlString);}
                else {
                htmlString = "<h3>" + data.matches.length+ " related desserts found</h3>"
                $('.food').append(htmlString)
               
                //add the circles 
                app.drawFoodData(data.matches);
                
                };
            }
        });
    },
    
    drawFoodData: function(theDesserts) {
        console.log('Food data:\n',theDesserts);
        //set default values for table entry
        var foodname = "Not Available"; 
        var foodcourse = "Not Available";
        var fimage = "fooddefault.jpg";
        var course = "Not Available";
        var width = $(window).width();
        var height = 350;
        
        var t = d3.transition()
            .duration(750)
            .ease(d3.easeLinear);

           var color = d3.scaleSequential()
            .domain([0, 100])
            .interpolator(d3.interpolateRainbow);    
        
        d3.select(".sel").transition(t).attr("cx",width-30)
        
        
        d3.select("svg").selectAll("rect").data(theDesserts).enter().append("rect")
            .attr("width",20).attr("height", 20).attr("x", width-200).attr("y",function(d,i){return i*30;}).attr("fill",function(d,i) {console.log(color(i));return color(i);})
            
            .on("click",function() {  //check if values in json return
        if (theDesserts.attributes && theDesserts.attributes.course){
        course = theDesserts[i].attributes.course
        } ; 
                        
        if(theDesserts.recipeName){
        foodname = theDesserts.recipeName};
                        
        if (theDesserts.smallImageUrls){
        fimage = theDesserts.smallImageUrls[0]};
      
        $('.food').html(foodname);
                    
    })
       

}
}
    
