// display variables
var displayMap;
let view;
var geocodereturn1 = {};

function loadModule(moduleName) {
  return new Promise((resolve, reject) => {
    require([moduleName], (module) => {
      if (module) {
        resolve(module);
      } else {
        reject(new Error(`Module not found: ${moduleName}`));
      }
    }, (error) => {
      reject(error);
    });
  });
}

async function initializeGeocodingAddresses() {
  try {
    const [esriConfig, Map, MapView, locator, Directions, RouteLayer] =
      await Promise.all([
        loadModule("esri/config"),
        loadModule("esri/Map"),
        loadModule("esri/views/MapView"),
        loadModule("esri/rest/locator"),
        loadModule("esri/widgets/Directions"),
        loadModule("esri/layers/RouteLayer"),

      ]);

    esriConfig.apiKey =
      "AAPK002db76c90ea45519a90d66e8a496decoBktunfgOJ1_ok10cjiP6LEPiExv3nLIVKTtn5eLqDuL819o-dH9FQ8KTRWH42U8"; // Will change it

      const routeLayer = new RouteLayer();

    displayMap = new Map({
      // basemap: "arcgis-light-gray",
      // basemap: "arcgis/navigation",
      basemap: "topo-vector",
      layers: [routeLayer]
    });

    view = new MapView({
      center: [-118.24, 34.05], // longitude, latitude, centered on Los Angeles
      container: "displayMap",
      map: displayMap,
      zoom: 14,
      highlightOptions: {
        color: "#39ff14",
        haloOpacity: 0.9,
        fillOpacity: 0,
      },
    });

    // new RouteLayer must be added to Directions widget
    let directionsWidget = new Directions({
      layer: routeLayer,
      apiKey: esriConfig.apiKey,
      view
    });

    // Add the Directions widget to the top right corner of the view
    view.ui.add(directionsWidget, {
      position: "top-right"
    });


    // const serviceUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

    //   view.on("click", function (evt) {
    //     const params = {
    //       location: evt.mapPoint
    //     };

    //     locator.locationToAddress(serviceUrl, params).then(
    //       function (response) {
    //         // Show the address found
    //         const address = response.address;
    //         showAddress(address, evt.mapPoint);
    //         console.log(geocodereturn1, "geocodereturn1")
    //       },
    //       function (err) {
    //         // Show no address found
    //         showAddress("No address found.", evt.mapPoint);
    //       }
    //     );

    //   });

    //   function showAddress(address, pt) {
    //     geocodereturn1.longitude = Math.round(pt.longitude * 100000) / 100000
    //     geocodereturn1.latitude = Math.round(pt.latitude * 100000) / 100000

    //     view.openPopup({
    //       title: +Math.round(pt.longitude * 100000) / 100000 + ", " + Math.round(pt.latitude * 100000) / 100000,
    //       content: address,
    //       location: pt
    //     });
    //     return geocodereturn1;
    //   }



    await view.when();

    //add widgets
    addWidgets()
      .then(([view, displayMap]) => {
        console.log(
          "Widgets Returned From Require Scope",
          view,
          displayMap,
          featureLayer
        );
        // You can work with the view object here
      })
      .catch((error) => {
        // Handle any errors here
      });

    return [view, displayMap]; // You can return the view object
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error; // Rethrow the error to handle it further, if needed
  }
}

// calling
initializeGeocodingAddresses()
  .then(() => {
    console.log("Map Returned From Require Scope", displayMap);
    // You can work with the view object here
  })
  .catch((error) => {
    // Handle any errors here
  });

async function addWidgets() {
  try {
    // await initializeMap();

    const [
      BasemapGallery,
      Expand,
      ScaleBar,
      Search,
      Home,
    ] = await Promise.all([
      loadModule("esri/widgets/BasemapGallery"),
      loadModule("esri/widgets/Expand"),
      loadModule("esri/widgets/ScaleBar"),
      loadModule("esri/widgets/Search"),
      loadModule("esri/widgets/Home"),
    ]);

    var basemapGallery = new BasemapGallery({
      view: view,
    });

    var Expand22 = new Expand({
      view: view,
      content: basemapGallery,
      expandIcon: "basemap",
      group: "top-right",
      // expanded: false,
      expandTooltip: "Open Basmap Gallery",
      collapseTooltip: "Close",
    });
    view.ui.add([Expand22], { position: "top-left", index: 6 });

    var scalebar = new ScaleBar({
      view: view,
      unit: "metric",
    });
    view.ui.add(scalebar, "bottom-right");

    var search = new Search({
      //Add Search widget
      view: view,
    });
    view.ui.add(search, { position: "top-left", index: 0 }); //Add to the map

    var homeWidget = new Home({
      view: view,
    });
    view.ui.add(homeWidget, "top-left");

    await view.when();

    return [view, displayMap]; // You can return the view object
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error; // Rethrow the error to handle it further, if needed
  }
}

