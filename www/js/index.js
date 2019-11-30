var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        getLocation();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
// function to cath all the errors
function onError(message){
    console.log('program crashed because: ' + message)
}
// adding the Location to the application
function getLocation(){
    navigator.geolocation.getCurrentPosition(geoCallback, onError)
}
var coords;
function geoCallback(position){
    var lat = Number(position.coords.latitude)
    var lon = Number(position.coords.longitude)
    // placing the coordinates into a variable for easy handling
    coords = lat +"+"+ lon
    openGateAPI()
};

// here i added the API to get the city and country from the coordinates
// given by the Geocallback Function
function openGateAPI(){
    var http = new XMLHttpRequest();
    // as the updated coordinates are in a variable, i just placed the variable in the API URL
    const url ="https://api.opencagedata.com/geocode/v1/json?q="+coords+"&key=7281aaf002ec4fe88734b4d64d6e9c69";
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response); 
        // printing attributes in the front end
        var country = responseJSON.results[0].components.country;
        var city = responseJSON.results[0].components.city;
        var currencyName = responseJSON.results[0].annotations.currency.name;
        var isoCode = responseJSON.results[0].annotations.currency.iso_code;
        document.getElementById("coordinates").innerHTML = "You are Currently in "+ city +", "+ country;
        document.getElementById("currency").innerHTML = "The Local Currency is the "+ currencyName;
        document.getElementById("isoCode").innerHTML = isoCode; 
    };
};

function currencyAPI(){
    var http = new XMLHttpRequest();
    // Currency API key
    const url ="http://www.apilayer.net/api/live?access_key=3e548696459784a7d79c5204a4cc4d2d";
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
            var response = http.responseText;
            var responseJSON = JSON.parse(response); 
            // here i get the currency code from the front end 
            var currency = document.getElementById("isoCode").innerHTML;
            // create an empty array for the be field by the values of the quotes
            const rate = []
            for(const value in responseJSON.quotes){
                rate.push(value);
            }
            // once i have the array i can iterate through it and compare its values
            // with the currency got from the openGateAPI
            for(var num in rate){
                // note that all values in the currencyAPI first start with "USD"
                // so the the currency value from the openGateAPI
                if (rate[num] == "USD"+currency){
                    // once the comparison is done and succesful
                    // we take the value from the currencyAPI
                    var amount = responseJSON.quotes[rate[num]]
                    // and place it in the front end for calculation purposes
                    document.getElementById("currentChange").innerHTML = amount;
                }else{
                    continue
                }
            }
    }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in



