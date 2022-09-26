function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(myMap);
    } else { 
        console.log("Ups");
    }
}
function myMap(position){
    var mapProp = {
        center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
        zoom: 5,
    };
    document.getElementById("anchor").href = `https://gps-coordinates.org/my-location.php?lat=${position.coords.latitude}&lng=${position.coords.longitude}`;
    document.getElementById("anchor").innerHTML = "Click me &amp Check my position";
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}