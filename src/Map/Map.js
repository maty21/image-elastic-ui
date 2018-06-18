import React, { Component } from 'react'
import extend from 'lodash/extend'
import ReactMapGL from 'react-map-gl';
import { Marker } from 'react-map-gl';
import { fromJS } from 'immutable';
import {
    SearchkitManager, SearchkitProvider,
    SearchBox, RefinementListFilter, Pagination,
    HierarchicalMenuFilter, HitsStats, SortingSelector, NoHits,
    ResetFilters, RangeFilter, NumericRefinementListFilter,
    ViewSwitcherHits, ViewSwitcherToggle, DynamicRangeFilter,
    InputFilter, GroupedSelectedFilters,
    Layout, TopBar, LayoutBody, LayoutResults,
    ActionBar, ActionBarRow, SideBar, SearchkitComponent
} from 'searchkit'
import './index.css'
class Map extends SearchkitComponent {
    constructor() {

    }
    state = {
        viewport: {
            width: 1000,
            height: 1000,
            latitude: 39.833851,
            longitude: -74.871826,
            zoom: 14,

        },
        results: null
    };

    render() {
        let markers = null;
        console.log(this.state);
        if (this.state.results && this.state.results.hits) {
            markers = this.state.results.hits.hits.map(p =>
                <Marker latitude={p._source.point.lat} longitude={p._source.point.lon} offsetLeft={-20} offsetTop={-10}>
                    <img src="./location.png" color="blue" />
                </Marker>
            )
        }

        const mapStyle = fromJS({
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
        return (
            <ReactMapGL style={{ margin: '15px' }} {...this.state.viewport} mapStyle={mapStyle} onViewportChange={(viewport) => this.setState({ viewport })}>
                {markers}
            </ReactMapGL>)
    }
}




