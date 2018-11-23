function addressSearch() {
            // Get the person's entered address
            var input = document.getElementById('address').value;
            // Convert the address into the right format for the OpenStreetMaps search
            var spacesReplaced = input.replace(" ", "%20");
            // Send the user's address to OpenStreetMaps and get the returned city
            var searchURL = "https://nominatim.openstreetmap.org/search/" + input + "?format=json&addressdetails=1&limit=1&polygon_svg=1";
            //console.log(searchURL);
            $.post(searchURL,
                function (data) {
                    console.log(data);
                    var city = data[0].address.city;
                    //console.log(city);
                    //document.getElementById("result").innerHTML = " is in "+city;
                    //Update info bubble on map:
                    showRegs(L.latLng(data[0].lat, data[0].lon));
                    //^^this only works because it can only get run after the body script tag initializes showCity
                });
            return false;
        }
        $(document).ready(function () {
            // Set up button click handler for the search form
            $("button").click(function () {
                addressSearch();
            });

            $("#searchSubmit").on("submit", function (e) {
                e.preventDefault();
            });;
        });

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
            console.log(coopWidth);
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
                var outsideChickens = Math.floor((outsideArea / 4));
                var coopChickens = Math.floor((coopArea / 1));
                //determining if you use the outsideChickens number or coopChickens number
                //needs to have ability to cap at 8
                if (outsideChickens >= 1 && coopChickens >= 1) {
                    if (outsideChickens >= 8 && coopChickens >= 8)
                        result_str = "You are allowed to have 8 chickens!!!";
                    else if ((outsideArea / coopArea) >= 1)
                        result_str = "You are allowed to have " + outsideChickens + " chickens!!!";
                    else result_str = "You are allowed to have " + coopChickens + " chickens!!!";
                }
                else
                    result_str = "You are not providing enough area for the chickens!!! BRAHHH!!!!";
            }
            else
                result_str = "You have entered invalid length/with values";
            //alert(result_str);
            document.getElementById("chickens-response").innerHTML = result_str;
            return result_str;
            //mention permits for more chickens?
        }