$(document).ready(function () {
  
  //Set up map:
  var mymap = L.map('mapid').setView([38.66085, -90.362549], 11);
  L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(mymap);

  //Initialize popup object to show information on the map:
  var popup = L.popup();


  // Function to calculate how many chickens allowed for a St. Louis City address
  function calcCityChickens() {
      //String used to display the determined chicken eligibility:
      var result_str;
      //city of saint louis
      //started walter jenkins
      //the city of saint louis requires that the individual have a 4 sq feet to 1 chicken for outdoor space
      //there is also to be 1 sq foot of indoor space for each chickens
      //there is a maximum of 8 chickens allowed in the city of saint louis without a permit
      //the purpose of this code is to estimate based on the user's parameters how many chickens they are allowed to have
      //user coop width and length
      var coopWidth = document.forms["coopSTL"]["cwSTL"].value;
      var input_valid = true;
      if (coopWidth == "") //needs to ensure that it is also an integer
          input_valid = false;
      var coopLength = document.forms["coopSTL"]["clSTL"].value;
      if (coopLength == "") //needs to ensure that it is also an integer
          input_valid = false;
      //user fence width and length
      var fenceWidth = document.forms["coopSTL"]["fwSTL"].value;
      if (fenceWidth == "") //needs to ensure that it is also an integer
          input_valid = false;
      var fenceLength = document.forms["coopSTL"]["flSTL"].value;
      if (fenceLength == "") //needs to ensure that it is also an integer
          input_valid = false;
      if (input_valid) {
          //calculation of fence and coop area
          var fenceArea = fenceWidth * fenceLength;
          var coopArea = coopLength * coopWidth;
          //calculation of outside space minus the footprint of the coop
          var outsideArea = fenceArea - coopArea;
          //calculation of the amount of chickens for both the inside and outside separately
          const outsideChickens = Math.floor((outsideArea / 4));
          const coopChickens = Math.floor((coopArea / 1));
          //determining if you use the outsideChickens number or coopChickens number
          //needs to have ability to cap at 8
          if (outsideChickens >= 1 && coopChickens >= 1) {
              if (outsideChickens >= 8 && coopChickens >= 8) {
                  result_str = "You are allowed to have 8 chickens!!!";
              } else if ( coopChickens >= outsideChickens) {
                  result_str = "You are allowed to have " + outsideChickens + " chickens!!!";
              } else {
                  result_str = "You are allowed to have " + coopChickens + " chickens!!!";
              }
          }
          else
              result_str = "You are not providing enough area for the chickens!!! BRAHHH!!!!";
      }
      else
          result_str = "You have entered invalid length/width values";
      //alert(result_str);
      document.getElementById("chickens-response").innerHTML = result_str;
      return result_str;
      //mention permits for more chickens?
}
  /**
   * Given all the location information, creates the formatted text to go into the popup.
   */
  function parseResult(city, county, state, popup, map, coords) {
    //Parse result:
    var place = city;
    if (city == undefined || city == '') place = "Unincorporated " + county;
    var popup_content = place + ":<br />";
    // Look up the regulations string for resulting location using JS Objects (hashtables):
    if (state == "Missouri") {
      if (city == undefined || city == '') {
        if (regsData.missouri.counties[county] != undefined) {
          popup_content += regsData.missouri.counties[county];
        } else {
          popup_content += "Unknown :(";
        }
      } else {
        if (regsData.missouri.cities[city] != undefined) {
          popup_content += regsData.missouri.cities[city];
        } else {
          popup_content += "Unknown :(";
        }
        if (city == "St Louis") {
           coop_form = document.getElementById("coopForm").innerHTML;
           popup_content += "<form id=\"coopSTL\">" + coop_form +
             "<div id=\"chickens-response\"></div></form>";
         }
      }
    } else {
      // Check Illinois too:
      if (city == undefined || city == '') {
        if (regsData.illinois.counties[county] != undefined) {
          popup_content += regsData.illinois.counties[county];
        } else {
          popup_content += "Unknown :(";
        }
      } else {
        if (regsData.illinois.cities[city] != undefined) {
          popup_content += regsData.illinois.cities[city];
        } else {
          popup_content += "Unknown :(";
        }
      }
    }
    // Show source only if regulations shown
    if ((regsData.missouri.counties[county] != undefined) || (regsData.missouri.cities[city] !=
      undefined) || (regsData.illinois.counties[county] != undefined) || (regsData.illinois.cities[
        city] != undefined)) {
      popup_content += '<br /><br />Source:<br /><a href="' + regsData.source.url + '">' + regsData.source.url +
        '</a>';
    }

    //Display result on the map:
    popup.setContent(popup_content);
    popup.setLatLng(coords);
    popup.openOn(map);
  }


  //Show chicken regulations at coordinates:
  function showRegs(coords) {
    arcgisRest.reverseGeocode([coords.lng, coords.lat], {
      'params': {
        'featureTypes': 'Locality'
      }
    }).then(function (response) {
      parseResult(response.address.City, response.address.Subregion, response.address.Region, popup, mymap, coords);
    }.bind(this));
  }

  /**
   * Show regulations given an address string
   * @param {string} input 
   */
  function showRegsAddress(input) {
    arcgisRest.geocode(input).then(function (data) {
      showRegs(L.latLng(data.candidates[0].location.y, data.candidates[0].location.x));
    });
  }

  // Handler for map click events:
  mymap.on('click', function (e) {
    showRegs(e.latlng);
  });

  //Set up button click handler for the search form:
  $("button").click(function () {
    var input = document.getElementById('address').value;
    showRegsAddress(input);
  });

  // setup click handler for when the "How many chickens can I have?" button is clicked,
  // run our "calcCityChickens" function.
  // We are using a ".on" as a "Delegated event handler" here because Leaflet creates the
  // popup dynamically so doing $("#calcChickens").click(...) will not work. 
  // See "Direct and delegated event handlers" section here: http://api.jquery.com/on/
  $('body').on('click', "#calcChickens", function() {
    calcCityChickens();
  });

  // SETUP AUTOCOMPLETE
  // for options see here: http://api.jqueryui.com/autocomplete/
  $("#address").autocomplete({
    source: function (request, response) {
      arcgisRest.suggest(request.term, {
        params: {
          location: '-90.18,38.62' // origin point location that is used to sort geocoding candidates based on their proximity to the location
        }
      }).then(function (data) {
        response(data.suggestions.map(function (suggestionObject) {
          return {
            label: suggestionObject.text,
            value: suggestionObject.text
          };
        }));
      }.bind(this));

    },
    minLength: 2,
    select: function (event, ui) {
      // When the user selects an item from the dropdown, search on that address:
      showRegsAddress(ui.item.value);
    }
  });

  // load the JSON regs data dynamically.
  var regsData = {};
  $.get( "regs_data.json", function( data ) {
    regsData = data;
  }, 'json');
});