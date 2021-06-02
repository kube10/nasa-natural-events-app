const MapCtrl = (function(UICtrl, EventsCtrl){

  /*

  variables to be used by Leaflet

  */
  let map;
  let geoJsonLayer;

  //feature constructor
  const Feature = function(type, properties, geometry) {
    this.type = type;
    this.properties = properties;
    this.geometry = geometry
  }

  //Popup constructor
  const Popup = function(id, popup) {
    this.id = id;
    this.popup = popup;
  }

  //data structure
  const data = {
    features: [],
    popups: []
  }

  //Build html used for displaying leaflet popupContent
  function buildPopupHtml(event) {
    //set & format dates
    const startDateFull = new Date(event.geometries[0].date);

    const startDate = `${startDateFull.getMonth()} -  ${startDateFull.getDate()} - ${startDateFull.getFullYear()}`

    const endDateFull = new Date(event.geometries[event.geometries.length - 1].date)

    const endDate = `${endDateFull.getMonth()} -  ${endDateFull.getDate()} - ${endDateFull.getFullYear()}`

    html = `
            <div class="card-content">
              <h6>${event.title}</h6>
              <p>${event.categories[0].title}</p>
            </div>
            <hr>
            <div class="card-action">
              <span><b>Start date: </b> ${startDate}</span><br>
              <span><b>Last update: </b> ${endDate}</span>
            </div>
          `

    return html;
  }

  /*

    Create GEOJSON features based on event properties, provided by the API. Features will be added to local data structure, to be used by Leaflet to create map markers. Method can also be used to update features (meant to be shown).

  */
  function addFeaturesToData(events) {
    //empty features array before pushing (necessary for updating features)
    data.features = []

    //init new feature for each event, only first geometry provided by API will be added.
    events.forEach(event => {
      const newFeature = new Feature('Feature', {
        id: event.id,
        name: event.title,
        category: event.categories[0].title,
        popupContent: buildPopupHtml(event)
      }, event.geometries[0])

      data.features.push(newFeature)
    });
  }


  //Build Leaflet map using mapbox.
  function buildMap() {

    map = L.map('map').fitWorld()

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      minZoom: 2,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoibnJvYmVyazEwIiwiYSI6ImNrYm94OGgxbDI3NHAyeGw5eDRrYjI0bmQifQ.SHwwfGTpOTmVlJsMmnQ7Gg'
    }).addTo(map);
  }

  /*

  markers to be added based on local feature data. Event category colors are hard coded in the style function, inside the geoJSON options. method can be used to reset markers when filters change.

  */
  function setMarkers(map) {

    /* Define the looks of markers added on map. Color is overwritten by style function in geoJSONLayer options*/
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#3f51b5",
        color: "transparent",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    geoJsonLayer = L.geoJSON(data.features,
          {
            //Set style based on event categories
            style: function(feature) {
              switch(feature.properties.category.toLowerCase()) {
                case 'severe storms': return {fillColor: "#e91e63"}
                case 'wildfires': return {fillColor: "#f44336"}
                case 'sea and lake ice': return {fillColor: "#00bcd4"}
                case 'volcanoes': return {fillColor: "#ff9800"}
              }
            },

            //build vector layer based on point in feature data
            pointToLayer: function(feature, latlng) {
              return L.circleMarker(latlng, geojsonMarkerOptions)
            },

            //attach popups to each feature before adding to the geoJsonLayer
            onEachFeature: function(feature, layer) {
              if (feature.properties && feature.properties.popupContent) {
                popup =  layer.bindPopup(feature.properties.popupContent);

                //Save popup to data structure, to be used later.
                const newPopup = new Popup(feature.properties.id, popup);

                data.popups.push(newPopup)
              }
            }

      })

    geoJsonLayer.addTo(map);
    console.log(geoJsonLayer.getLayers()[0]);

    // geoJsonLayer.getLayers()[0]._popup.openOn(map)
    // geoJsonLayer.layers.popup.openOn(map)

  }

  //Fly to point
  function flyToEvent(event) {
    console.log("Flying to event");
    const coordinates = [event.geometries[0].coordinates[1], event.geometries[0].coordinates[0]]
    console.log(coordinates);
    map.flyTo(coordinates, 3)
  }

  //open popup based on event ID
  function openFeaturePopUp(event) {
    data.popups.forEach(popup => {
      if (popup.id === event.id) {
        popup.popup.openPopup();
      }
    })
    // data.popups[0].popup.openPopup()
  }

  // on popup opened
  function onPopupOpen() {
    geoJsonLayer.on('popupopen', e => {
      //Get id from popup source
      let id = e.popup._source.feature.properties.id;

      console.log(e.popup._source.feature);

      //set active list item in ui controller
      UICtrl.setActiveListItem(id)

      const coordinates = [e.popup._source.feature.geometry.coordinates[1], e.popup._source.feature.geometry.coordinates[0]]

      map.flyTo(coordinates, 3)

    })
  }

  /*

  public methods:
  - init map: build the leaflet map / add features to module data / setmarkers on map based on feature data
  - resetFeatures
  - resetMarkers

  */
  return {
    //reset features when filtered
    focusEvent: function(event) {
      flyToEvent(event)
      openFeaturePopUp(event)
    },
    resetFeatures: function(events) {
      addFeaturesToData(events)
    },
    resetMarkers: function() {
      geoJsonLayer.clearLayers()
      setMarkers(map)
    },
    init: function(events) {

      addFeaturesToData(events)

      buildMap()

      setMarkers(map)

      onPopupOpen()

    }
  }
})(UICtrl, EventsCtrl)
