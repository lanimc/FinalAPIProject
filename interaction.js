var app = {
	initialize: function() {
		app.getSearchTerm();
        
	},
    
    //function to get the user entered term from the searchbox
    getSearchTerm: function() {
        
        //when the search button is clicked run these commands
        $('#submitSearch').click(function(){
        
            //Clear any previous search results 
            $('.beers').html('');
            $('.food').html('');
            $('.draw').html('');

            //Get the input box value
            var userTerm = $('#inputBox').val();

            //run the beer api call with the users keyword
            app.getBeerData(userTerm);
        })
        
    },
    
    //call to beer api
    getBeerData: function(Term) {
		console.log("Beers API Call");
        
        //return only beers with ingredients. search all areas for users keyword
		var BeerURL = "http://api.brewerydb.com/v2/search?key=";
		var myBeerAPIKey = "adc1e562bb00337ee44e0dcf23cfefcc";
        var SearchParam = "&q="+Term+"&type=beer&withIngredients=Y"
		var BeerReqURL = BeerURL + myBeerAPIKey+SearchParam;
        
		$.ajax({
			url: BeerReqURL,
			type: 'GET',
			dataType: 'json',
			
            //if there's an error, log it to the console and put a message in the beer results section
            error: function(err){
				console.log(err);
                var htmlString = "<h3>There was an error searching for " + Term + " beers. Try another keyword search.</h3>"
                $('.beers').append(htmlString)
			},
			//if we get results, put a message in the beer results section and call the draw beer results function
            success: function(data){
                
                //set the success message
                var htmlString = "<h3>No '" + Term + "' beers found</h3>"
                if(data.data == null) { $('.beers').append(htmlString);}
                else{
                htmlString = "<h3>" + data.data.length+ " '" +Term + "' beers found</h3>"
                $('.beers').append(htmlString)
                
                //call the function to draw the beer results 
                app.drawBeerData(data.data);
                
                }
                
			}
            
            
		});
	},
    
    //function to draw beer results using force layout in d3
    drawBeerData: function(theBeers){
        console.log("Draw Beer Data", theBeers);    
        
        //set default values 
        var beername = "No beer name available";
        var beerstyledesc = "No style description available"
        var beerstylename = "No style name available";
        var beerdesc = "No beer description available";
        var label = "beercloseupc.png";
                
                
        //set up d3 visualization
        var width = $('.draw').width()-10;
        var height = $('.draw').height()-10;
        
        var svg = d3.select(".draw").append("svg").attr("width",width).attr("height",height);
        
        //set up the animation of the results
        var simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-4).distanceMax([70]))
            .force("center", d3.forceCenter(width / 2, height / 2));
    
        simulation
            .nodes(theBeers)
            .on("tick", ticked);
        
        //set up the images displayed: for each beer result, create a group, add image and title to it
        var g = svg.selectAll("g")
            .data(theBeers, function(d,i) { return i; })
        
        var node = g.enter().append("svg:g")
            .attr("class", "nodes")
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));
        
        node.append("svg:image")
            .attr("xlink:href",  function(d) { var cimage; if(d.labels && d.labels.icon){cimage = d.labels.icon} else{ cimage = label}; return cimage})
            .attr("height", 40)
            .attr("width", 40)
            .attr("x", function(d) { return -25;})
            .attr("y", function(d) { return -25;});
        
        node.append("title")
            .text(function(d) { return d.name ;});
        
        //set up the user interaction with the beers: on click show title and description information; on doubleclick call the function to get desserts
        node.on("click", function(d,i) //clear previous actions and reset the classes
                {d3.selectAll(".dnode").remove(); 
                d3.selectAll('.draw text').remove();
                d3.selectAll(".nodes").attr("class","nodes"); 
                
                $('.beers h4').empty();
                $('.beers h5').empty();
                $('.beers p').empty();

                //change from defaults for nonmissing values
                if(d.name){beername = d.name.toUpperCase()};
                if(d.description){beerdesc = d.description}; 
                if(d.style && d.style.name) {beerstylename = d.style.name.toUpperCase()};
                if(d.style && d.style.description){beerstyledesc = d.style.description};
                if(d.labels && d.labels.icon){label = d.labels.icon};
                
                var htmlString = "<h4>"+beername+"</h4><h5>"+beerstylename+"</h5><p>"+beerdesc+"<br>"+beerstyledesc+"</p>"
                
                $('.beers').append( htmlString );
                 
                d3.select(".draw svg").append("text").text(beername).attr("transform","translate(0,20)");
                d3.select( this ).attr("class","nodes sel");
                                                    });
                                
        node.on("dblclick",function(d) { 
            $('.food').html('');  
            d3.selectAll(".dnode").remove(); 
            d3.selectAll(".node").attr("class","node");  
            d3.select(this).attr("class", "node sel");  
            
            app.parseBeerData(beerdesc+beerstyledesc);});
        
        
        //helper functions
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
            console.log("ParseBeerData");
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
                    var minconf = _.min(_.pluck(foodresponse.entities,"confidenceScore"));
                    var maxconf = _.max(_.pluck(foodresponse.entities,"confidenceScore"));
                    var minrela = _.min(_.pluck(foodresponse.entities,"relevanceScore"));
                    var maxrela = _.max(_.pluck(foodresponse.entities,"relevanceScore"));
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
    
    //function to call the food api
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
                //set the defaults
                var name="Not Available";
                var image="fooddefault.jpg";
                var flavors="Not Available";
                var ingredients = "Not Available";
                var rating = 0;
                
                
                
            console.log("Got the desserts:\n", data.matches);
            var htmlString = "<h3>No related desserts found</h3>"
                if(data.matches == null) { $('.food').append(htmlString);}
                else {
                    htmlString = "<h3>" + data.matches.length+ " related desserts found</h3>"
                    $('.food').append(htmlString);
                    var flare=[], hdata, leaves=[];
                    
                //build the dataset for pack layout
                  for(var i=0; i < data.matches.length; i++){
                          if(data.matches[i].recipeName){name = data.matches[i].recipeName}
                          if(data.matches[i].smallImageUrls){image = data.matches[i].smallImageUrls[0]}
                          if(data.matches[i].flavors){flavors=data.matches[i].flavors}
                          if(data.matches[i].ingredients){ingredients=data.matches[i].ingredients}
                        if(data.matches[i].rating){rating=data.matches[i].rating}

                      leaves.push({'name':name, 'image':image, 'flavors':flavors, 'ingredients':ingredients, 'rating': rating});
                    };
                    
 
                    hdata={"name":$("#inputBox").val(),"children":[{"name":$(".sel title")[0].innerHTML,"children":[{"name": "desserts","children":leaves}]}]};
                                        
                    console.log("hierarchy:\n",hdata);
                    console.log("title:\n",$(".sel title")[0].innerHTML);
    

                    
                //add the circles 
                app.drawFoodData(data.matches, hdata);
                   
            }
        }});
    },
    
    drawFoodData: function(theDesserts,packData) {
        console.log('Food data:\n',theDesserts);

        var width = $('.food').width();
        var height = 250;
        
        var t = d3.transition()
            .duration(750)
            .ease(d3.easeLinear);

           var color = d3.scaleSequential()
            .domain([0, 100])
            .interpolator(d3.interpolateRainbow);    
        
        d3.select("g .sel").transition(t).attr("dx",100);
        
            var svg = d3.select(".food").append("svg").attr("width",width).attr("height",height),
            diameter = width/2.5,
            g = svg.append("g").attr("transform", "translate(2,2)")
            

            var pack = d3.pack()
                .size([diameter - 4, diameter-4]);
        
        //set layout. size according to dessert rating
        root = d3.hierarchy(packData)
            .sum(function(d) { return d.rating; })
            .sort(function(a, b) { return b.value - a.value; });

        var dnode = g.selectAll(".dnode")
            .data(pack(root).descendants())
            .enter().append("g")
            .attr("class", function(d) { return d.children ? "dnode" : "leaf dnode"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        dnode.append("title")
            .text(function(d) { return d.data.name ; });
        
        dnode.append("svg:image")
            .attr("xlink:href",  function(d) {return d.image;})
            .attr("height", 40)
            .attr("width", 40)
            .attr("x", function(d) { return -25;})
            .attr("y", function(d) { return -25;});
        
        dnode.append("circle")
            .attr("r", function(d) { return d.r; });
        
        
        //on click, add the dessert info  
        dnode.on("click",  function(d){ console.log(d);
                  $('.food h4').empty();
                  $('.food h5').empty();
                  $('.food p').empty();
                  return $('.food').append("<h4>"+d.data.name.toUpperCase()+"</h4><h5>Flavors: "+_.pairs(d.data.flavors)+"</h5><p>Ingredients: "+d.data.ingredients+"<br>Rating: "+d.data.rating+"</p>")} ) ;
       
        //append text to just the children
       dnode.filter(function(d) { return !d.children; }).append("text")
      .attr("dy", ".3em")
      .text(function(d) { return d.data.name.substring(0, d.r / 3); });


}}
    
