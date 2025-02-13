document.addEventListener('DOMContentLoaded', function() {
    // Initialize Google Maps
    initMap();
});

function initMap() {
    // Replace these coordinates with your actual restaurant location
    const restaurantLocation = { lat: YOUR_LATITUDE, lng: YOUR_LONGITUDE };
    
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: restaurantLocation,
        styles: [
            {
                "featureType": "poi.business",
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            }
        ]
    });

    // Add a marker for the restaurant
    const marker = new google.maps.Marker({
        position: restaurantLocation,
        map: map,
        title: "Pikoy's Fried Chicken"
    });

    // Add an info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px;">Pikoy's Fried Chicken</h3>
                <p style="margin: 0;">123 Main Street, Your City</p>
            </div>
        `
    });

    // Show info window when marker is clicked
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

function showSalesHistory() {
    // This function would typically navigate to the sales history page
    window.location.href = 'index.html#dashboard';
}

