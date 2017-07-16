let markers = [];
let map = null;

function initMap() {
  let usa = {lat: 42.877742, lng: -97.380979};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: usa
  });
}

function populate() {
  let ips = document.getElementById('ips').value.split('\n');

  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];

  ips.forEach(function(ip) {
    $.getJSON('https://freegeoip.net/json/' + ip, function(data) {
      let info = new google.maps.InfoWindow({
        content: '<div id="content"><h1>' + data.city + '</h1></div>'
      });
      let marker = new google.maps.Marker({
        position: { lat: data.latitude, lng: data.longitude },
        map: map
      });
      marker.addListener('click', function() {
        info.open(map, marker);
      });
      markers.push(marker);
    });
  });
}
