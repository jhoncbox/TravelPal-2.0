// this is a section precreated by phoneGap
var app = {
    // when initializing the application, the getLocation is called
    // so then the other functions can use the coordinates values
    initialize: function() {
        this.bindEvents();
        getLocation();
    },
    // Bind Event Listeners
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // when the device is ready then the other function are called 
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        currencyAPI();
        getWeather();
        placeMap();
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
    console.log('program crashed because: ' + message);
}
// GetLocation function to get the coordinates from the device
function getLocation(){
    navigator.geolocation.getCurrentPosition(geoCallback, onError);
};
// --------------------------
// needed global variables for other functions
var lat;
var lon;
var climage;
var city;
var country;
var amount;
var isoCode;
// --------------------------
function geoCallback(position){
    lat = Number(position.coords.latitude);
    lon = Number(position.coords.longitude);
    // lat =64.144242 // for testing <--- ICELAND
    // lon =-21.942013 // for testing
    // we call the opeGate API function so, after getting the coordinates, we can get the information
    // from the location where the user currently is
    openGateAPI();
    
};
// --------------------------------------------------------------
// here i added the openGate API to get the city and country from the coordinates
// given by the Geocallback Function
function openGateAPI(){
    var http = new XMLHttpRequest();
    // as the updated coordinates are in a variable, their are just placed in the API URL
    const url ="https://api.opencagedata.com/geocode/v1/json?q="+lat+"+"+lon+"&key=7281aaf002ec4fe88734b4d64d6e9c69";
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response);
         
        // printing attributes in the front end
        // and changing the values of the global variables
        country = responseJSON.results[0].components.country;
        city = responseJSON.results[0].components.city;
        var currencyName = responseJSON.results[0].annotations.currency.name;
        isoCode = responseJSON.results[0].annotations.currency.iso_code;
        document.getElementById("coordinates").innerHTML = "You are Currently in "+ city +", "+ country;
        document.getElementById("currency").innerHTML = "The Local Currency is the "+ currencyName;
        document.getElementById("isoCode").innerHTML = isoCode; 
        document.getElementById("isoCode2").innerHTML = isoCode; 
    };
};
// --------------------------------------------------------
// Currency API
function currencyAPI(){
    var http = new XMLHttpRequest();
    // Currency API 
    const url ="http://www.apilayer.net/api/live?access_key=3e548696459784a7d79c5204a4cc4d2d";
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response); 
        
        // create an empty array for the be filled by the values of the quotes
        const rate = [];
        for(const value in responseJSON.quotes){
            rate.push(value);
        };
        // once i have the array, i can iterate through it and compare its values
        // with the currency got from the openGateAPI
        for(var num in rate){
            // note that all values in the currencyAPI first start with "USD"
            // so then i added the currency value from the openGateAPI
            if(rate[num] == "USD"+isoCode){
                // once the comparison is done and succesful
                // we take the value from the currencyAPI
                amount = responseJSON.quotes[rate[num]];
                // and place it in the front end for calculation purposes
                document.getElementById("currentChange").innerHTML = amount;
            }else{
                continue;
            };
        };
    };
};
// --------------------------------------------------------
// this is the app to calculate the user's input
function calculate(){
    // everytime the function is called, it also call the API function
    //  to stay up to date with the exchange rate
    // exchange gets the rate from the HTML where the current exchange is being displayed
    exchange = document.getElementById("currentChange").innerHTML;
    var num1 = Number(document.getElementById('USD').value);
    var num2 = Number(document.getElementById('@').value);    
    // initialized result from empty space
    var result =' ';
    // the if statement helps to know whether the user is exchanging USD or EUR 
    // NOTE: one of the fields in the front need to be empty for the calculation to work
    // otherwise will only will change from USD to the other currency
    if(num1 ==' '){
        result = (1/exchange)*num2;
        document.getElementById("USD").value = result;
    }else if(num2 = ' '){
        result = num1 * exchange;
        document.getElementById("@").value = result;
    };
};
// --------------------------------------------------------------
// function to get the local weather
function getWeather(){
    var http = new XMLHttpRequest();
    // the weather IPA, from here we will get the cityID to be used in the Widget call
    const url ="http://api.openweathermap.org/data/2.5/weather?"+"lat="+lat+"&"+"lon="+lon+"&APPID=2921d540e000bacc7e58d6bd25f134d4";
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response);
        climage = responseJSON.weather[0].description;  
        var mainClimage = responseJSON.weather[0].main;
        var cityId = responseJSON.id;
        // placing information into a placeholder in the front page
        document.getElementById("showWeather").innerHTML = mainClimage + ", " + climage
        // after getting the CityId we call the widget from the Open Weather maps API
        window.myWidgetParam ? 
        window.myWidgetParam : 
        window.myWidgetParam = [];  
        window.myWidgetParam.push({
            id: 5,
            // placing the city id here, always getting the local weather
            cityid: cityId,
            appid: '2921d540e000bacc7e58d6bd25f134d4',
            units: 'metric',
            containerid: 'openweathermap-widget-5',  
        });  
        (function() {
            var script = document.createElement('script');
            script.async = true;
            script.charset = "utf-8";
            script.src = "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(script, s);  
        })();
    };
};


// --------------------------------------------------------------
// Function File Saver
function saveFile(){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemCallback, onError);
}

function fileSystemCallback(fs){

    // Name of the file to be created
    var fileToCreate = "PersistentFile.txt";
    // Opening/creating the file
    fs.root.getFile(fileToCreate, fileSystemOptionals, getFileCallback, onError);
}

var fileSystemOptionals = { create: true, exclusive: false };

function getFileCallback(fileEntry){
    // when writing into the folder, I place the Country, City, the current weather
    //  and the currency exchange
    var text =  country + ", " + 
                city + ", " + 
                climage + ", " +
                "1 USD = "+ amount +" "+ isoCode + 
                "<br></br>" +
                // after writing the file, next time will get the current data
                //  in the value and rewrite the new data
                document.getElementById("fileSaved").innerHTML;
    
    var dataObj = new Blob([text], { type: 'text/plain' });
    
    // Write to the file
    writeFile(fileEntry, dataObj);

    // and reading the file
    readFile(fileEntry);
}

// writing into the file
function writeFile(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry 
    fileEntry.createWriter(function (fileWriter) {
        fileWriter.write(dataObj);
        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
        };
        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };
    });
}
// Reading the files
function readFile(fileEntry) {
    // Get the file from the file entry
    fileEntry.file(function (file) {
        // Create the reader
        var reader = new FileReader();
        reader.readAsText(file);

        reader.onloadend = function() {
            console.log("Successful file read: " + this.result);
            console.log("file path: " + fileEntry.fullPath);
            // this is to pass it to the front end
            document.getElementById('fileSaved').innerHTML = this.result;
        };
    }, onError);
}
// -------------------------------------------------------------
// google map IPA
// variable lat and lon are also place on this API link
function placeMap(){ 
    // then passed to the front end in the "map" placeholder
    document.getElementById("map").innerHTML = '<iframe width="100%" height="450" src="https://www.google.com/maps/embed/v1/view?key=AIzaSyDX5vLsAd7GcD8jtrFHsYKacLMHGg1cMZ0&center='+lat+','+lon+'&zoom=16"allowfullscreen></iframe>'
}
// --------------------------------------
// camera function 
var image;
function pics(){
    navigator.camera.getPicture(cameraCallBack, onError,);
}
function cameraCallBack(imageData){
    image = document.getElementById("image")
    image.src = imageData;
}
// ---------------------------------------------------------
// this function help the user to save a picture into a file to be read after
function savePic(){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, picSystemCallback, onError);
}
// the structure is the same as when saving a normal file
function picSystemCallback(fs){
    // Name of the file to be created
    var fileToCreate = "Pictures.txt";
    // Opening/creating the file
    fs.root.getFile(fileToCreate, fileSystemOptionals, getPicsCallback, onError);
}
function getPicsCallback(fileEntry){
    // here we create a new element "IMG" this way i can place the image taken from the camera function
    var img = document.createElement("IMG")
    img.setAttribute("src", image.src);
    img.setAttribute("width", "50%")
    img.setAttribute("height", "50%");
    document.getElementById("showImages").appendChild(img)
    
    var text =  document.getElementById("showImages").innerHTML
    var dataObj = new Blob([text], { type: 'text/plain' });
    
    // Write to the file
    writeFile(fileEntry, dataObj);

    // and reading the file
    readPicsFile(fileEntry);
}
// Reading the files
function readPicsFile(fileEntry) {
    // Get the file from the file entry
    fileEntry.file(function (file) {
        // Create the reader
        var reader = new FileReader();
        reader.readAsText(file);

        reader.onloadend = function() {
            console.log("Successful file read: " + this.result);
            console.log("file path: " + fileEntry.fullPath);
            // gettin the pics in the front end
            document.getElementById('showImages').innerHTML = this.result;
        };
    }, onError);
}