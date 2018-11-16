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
  let ips = document.getElementById('ips').value.split(/[\r\n]+/);

  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];

  ips.forEach(function(ip) {
    $.getJSON('/api/geolocate/' + ip, function(data) {
      let info = new google.maps.InfoWindow({
        content: '<div class="map-info-box"><p>' + data.city + ', ' + data.region_name + ', ' + data.zip + '</p><p>' + ip + '</p></div>'
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
