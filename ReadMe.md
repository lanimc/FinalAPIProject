# Beer and Dessert Pairings

<h2>Project Description</h2>
A single page (client-side only) web experience that leverages data from three web APIs and incorporates the use of the Javascript “interaction” library D3.

APIs:

<ul><li>BreweryDB</li>

<li>Yummly</li>

<li>Text Razor<li></ul>

![Beer & Dessert Pairings](https://github.com/lanimc/FinalAPIProject/blob/master/screenshot.png)

<h2>User Experience</h2><br>
Users enter a search word (top right of the page) that searches all BreweryDB data for beers containing the entered word.
Users can then click on the results, represented by their labels or default image of beer (center of the page) for more information about the beer.

Users can double click on the results  to look for related desserts that have similar ingredients. The ingredients are pulled from the beer and beer style description of the double-clicked on beer. This works by sending the beer and style descriptions to the textrazor api and searching for words related to food. the resulting entities are filtered by confidence and relevance score for the top 25% ranking scores. These ingredients are then sent through to the Yummly API.

Users can click on the dessert search results, represented by circles in the dessert information section at the bottom right hand of the page for more information on the dessert.


<h2>Future Work</h2>  

There is a lot of opportunity for improvement on the project, given additional time. 

<ul><li>Media queries to make the site more responsive</li>

<li>A call for the actual recipe or video on youtube on how to make the recipe</li> 

<li>Grouping the beers and desserts by flavor</li>

<li>Incorporating the dessert images</li>

<li>Incorporating a bar graph or other visual or filter for the dessert flavors</li>

<li>A transition on the selected beer to blow up the label and make it more prominent</li>

<li>Another brewery call for the beer ingredients and flavors</li></ul>
