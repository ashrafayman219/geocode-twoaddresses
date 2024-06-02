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
    const [esriConfig, Map, MapView, locator, Directions, RouteLayer, LayerList, reactiveUtils] =
      await Promise.all([
        loadModule("esri/config"),
        loadModule("esri/Map"),
        loadModule("esri/views/MapView"),
        loadModule("esri/rest/locator"),
        loadModule("esri/widgets/Directions"),
        loadModule("esri/layers/RouteLayer"),
        loadModule("esri/widgets/LayerList"),
        loadModule("esri/core/reactiveUtils"),

      ]);

    esriConfig.apiKey =
      "AAPK74e3a5fbb5854a438feab8efb8c87df5oqR9tQ_avwhI2Q96qgn0mcY_r8pmvUx0aJb6SkO6-GlbtfpahJj6zOJi_wRD_rp4"; // Will change it

      const routeLayer = new RouteLayer({
        defaultSymbols: {
          directionLines: {
            type: "simple-line",
            color: [0, 128, 0, 0.75],
            width: 6,
            cap: "square",
            join: "miter"
          },
          directionPoints: {
            type: "simple-marker",
            size: 0,
            color: [0, 0, 0, 0]
          },
          routeInfo: {
            type: "simple-line",
            width: 0
          }
          ,
          stops: {
            first: {
              type: "web-style",
              name: "car-rental",
              styleName: "Esri2DPointSymbolsStyle"
            },
            last: {
              type: "web-style",
              name: "parking",
              styleName: "Esri2DPointSymbolsStyle"
            }
          }
        }
      });

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
      // highlightOptions: {
      //   color: "#39ff14",
      //   haloOpacity: 0.9,
      //   fillOpacity: 0,
      // },
    });

    // new RouteLayer must be added to Directions widget
    let directionsWidget = new Directions({
      unit: "kilometers",
      layer: routeLayer,
      apiKey: esriConfig.apiKey,
      view,
      visibleElements: {
        layerDetails: false,
        saveAsButton: false,
        saveButton: false
      },

    });

    // Add the Directions widget to the top right corner of the view
    view.ui.add(directionsWidget, {
      position: "top-right"
    });


    // Use reactiveUtils to watch for route results
    directionsWidget.viewModel.watch("lastRoute", (routeResult) => {
      if (routeResult) {
        console.log(routeResult);
        const totalCosts = routeResult.routeInfo.totalCosts;
        
        if (totalCosts) {
          const totalDistance = totalCosts.kilometers || "N/A";
          const totalTime = totalCosts["travel-time"] || "N/A";

          console.log(`Total Distance: ${totalDistance} km`);
          console.log(`Total Time: ${totalTime} minutes`);
        } else {
          console.log("Total Costs data is not available.");
        }
      }
    });


    // directionsWidget.on("directions-finish", changeHandler);

    // function changeHandler(data) {
    //   console.log("done", data.result);
    //     if (data.result.routeResults.length > 0) {
    //     const features = data.result.routeResults[0].stops;
    //     features.forEach(function (result, i) {
    //       console.log(result.attributes.Name );
    //     });
    //   }
    // }




    const routeLayers = [routeLayer];

    const layerList = new LayerList({
      view,
      listItemCreatedFunction: (event) => {
        event.item.actionsSections = [
          [
            {
              title: "Show Directions and Zoom to Route",
              className: "esri-icon-navigation",
              id: "show-directions"
            }
          ]
        ]
      }
    });

    view.ui.add(layerList, { position: "top-left", index: 6 });

    layerList.on("trigger-action", (event) => {
      for (const layer of routeLayers) {
        if (layer === event.item.layer) {
          if (!layer.effect) {
            layer.effect = "bloom(1.5, 1px, 0.1)";
            directionsWidget.layer = layer;
            const extent = layer.routeInfo.geometry.extent.clone().expand(1.5);
            view.goTo(extent);
          }
          else {
            layer.effect = null;
            directionsWidget.layer = layer;
          }
        } else {
          layer.effect = null;
        }
      }
    });
















    // directionsReady();

    // async function directionsReady(){
    //   await directionsWidget.when();
    //   directionsWidget.layer.stops.at(0).name = "Campton, NH";
    //   directionsWidget.layer.stops.at(0).geometry = new Point({ x: -71.64133, y: 43.85191 });
    //   directionsWidget.layer.stops.at(1).name = "Plymouth, NH";
    //   directionsWidget.layer.stops.at(1).geometry = new Point({ x: -71.68808, y: 43.75792 });
    // }
    





















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

