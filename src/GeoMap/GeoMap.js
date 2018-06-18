import React from "react";
import Immutable from "immutable";
import * as _ from "lodash";
import ReactMapGL, { NavigationControl } from "react-map-gl";
import ScatterplotOverlay from "./ScatterPlotOverlay";
import {
  Accessor,
  AggsContainer,
  SearchkitComponent,
  FilterBucket,
  Utils,
  GeohashBucket,
  GeoBoundsMetric,
  SignificantTermsBucket,
  FilteredQuery,
  SearchkitManager
} from "searchkit";

import ViewportMercator from "viewport-mercator-project";
import { GeoAccessor } from "./GeoAccessor";

const host = "http://localhost:9200/image"

export class GeoMap extends SearchkitComponent {
 
  constructor(props) {
    super(props);
    this.searchkit  = props.searchkit;

   this.searchkit.addResultsListener.bind(this);
  
    this.mapStyle = Immutable.fromJS({
      "version": 8,
      "sources": {
        "nj": {
          'type': 'raster',
          'tiles': [
            'https://geodata.state.nj.us/imagerywms/Natural2015?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=Natural2015'
          ],
          'tileSize': 256
        }
      },
      //"glyphs": location.origin + location.pathname + "font/{fontstack}/{range}.pbf",
      "layers": [{
        "id": "background",
        "type": "background",
        "paint": {
          "background-color": "#ddeeff"
        }
      },
      {
        'id': 'zzz',
        'type': 'raster',
        'source': 'nj',
      }]
    });
    this.state = {
      displayNavigation: props.displayNavigation,
      viewport: {
        width: 1000,
        height: 1000,
        latitude: 39.833851,
        longitude: -74.871826,
        zoom: 17,
        isDragging: false

      },
      results:null
    }

    this.removalFn =  this.searchkit.addResultsListener((results) => {
      this.setState({ ...this.state, results });
      /*  console.log('------------------------------------');
       console.log(this.setState(results));
       console.log('------------------------------------'); */
    })
  }
  defineAccessor() {
    return new GeoAccessor();
  }

  centerFromBound(bound) {
    return {
      lat: (bound.top_left.lat + bound.bottom_right.lat) / 2,
      lng: (bound.top_left.lon + bound.bottom_right.lon) / 2
    };
  }

  getPoints() {
    let areas = this.accessor.getAggregations(["geo", "areas", "buckets"], []);
    return _.map(areas, area => {
      return this.centerFromBound(area.cell.bounds);
    });
  }

  _onViewportChange(opt) {
    const { viewport, displayNavigation } = this.state;

    if (!viewport.isDragging) {
      // stopped dragging, refresh the data
      const mercator = new ViewportMercator(viewport);

      const bounds = [
        mercator.unproject([0, 0]),
        mercator.unproject([viewport.width, viewport.height])
      ];

      const [nw, se] = bounds;

      const area = {
        top_left: { lat: nw[1], lon: nw[0] },
        bottom_right: { lat: se[1], lon: se[0] }
      };

      this.accessor.setArea(area);
      this.searchkit.search();
      this.setState({viewport:opt})
    }


  }

  render() {
    const { viewport, displayNavigation } = this.state;

    const locations = Immutable.fromJS(
      this.getPoints().map(item => [item.lng, item.lat])
    );

    const control = displayNavigation ? (
      <div
        className="geomap-navigation"
        style={{ position: "absolute", right: "5px", top: "5px" }}
      >
        <NavigationControl
          onViewportChange={this._onViewportChange.bind(this)}
        />
      </div>
    ) : null;

    return (
      <ReactMapGL mapStyle={this.mapStyle}
        {...viewport}
       onViewportChange={this._onViewportChange.bind(this)}
      >
        <ScatterplotOverlay
          {...viewport}
          locations={locations}
          dotRadius={2}
          globalOpacity={1}
          compositeOperation="screen"
        />
        {control}
        {this.props.children}

      </ReactMapGL>
    );
  }
}

GeoMap.defaultProps = {
  displayNavigation: true
};
