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
  ActionBar, ActionBarRow, SideBar
} from 'searchkit'
import cs from 'classnames';

import './index.css'
import styles from './styles.module.css';
import 'bootstrap/dist/css/bootstrap.css';
import styled from "styled-components";
import { GeoMap } from "./GeoMap/index";
//const host = "http://demo.searchkit.co/api/movies"
//const host ="http://elastic:MagicWord@localhost:9200/image"
const host = "http://localhost:9200/image"
const searchkit = new SearchkitManager(host, { basicAuth: "elastic:MagicWord" })




const StyledDiv = styled.div`
margin-left: 30px;
`
  ;
const StyledDivFlex = styled.div`
  display: flex;
  flex-direction: row;
  `
  ;
const ImagesHitsListItem = (props) => {
  const { sensorKind, sensor, resolutionWidth, resolutionHeight, location, image } = props.result._source
  const { bemBlocks } = props;

  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <div className={bemBlocks.item("poster")}>
        <img data-qa="poster" src={image} />
      </div>
      <div className={bemBlocks.item("details")}>
        <h2 className={bemBlocks.item("title")}>{sensor}</h2>
        <h3 className={bemBlocks.item("subtitle")}>From type {sensorKind}, with resolution {resolutionWidth}x{resolutionHeight}/10</h3>
      </div>
    </div>
  )

}

const ImagesHitsGridItem = (props) => {
  const { bemBlocks } = props;
  const { sensorKind, sensor, resolutionWidth, resolutionHeight, location, image } = props.result._source
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a target="_blank">
        <img data-qa="poster" alt="presentation" className={`${bemBlocks.item("poster")} myPoster`} src={image} width="170" height="200" />
        <div data-qa="title" className={bemBlocks.item("title")}>{sensor}</div>
        <div data-qa="title" className={`${bemBlocks.item("subtitle")} sensorKind`}>{sensorKind}</div>
      </a>
    </div>
  )

}


class App extends Component {

  constructor(props) {
    super(props);

    this.removalFn = searchkit.addResultsListener((results) => {
      this.setState({ ...this.state, results });
      console.log(this)
      /*  console.log('------------------------------------');
       console.log(this.setState(results));
       console.log('------------------------------------'); */
    })
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
      <SearchkitProvider searchkit={searchkit}>
        <Layout size="m"   >
          <TopBar className="bla" mod="sk-primary-theme-color--green" >
            <div className="my-logo">IndexR</div>
            <SearchBox autofocus={true} searchOnChange={true} prefixQueryFields={["sensor^1", "sensorKind^2", "location"]} />
          </TopBar>
          <StyledDivFlex>
            <div >
              <LayoutBody style={{ margin: "0px" }}>
                <SideBar style={{ margin: "0px" }}>
                  <InputFilter id="sensor" searchThrottleTime={500} title="sensor" placeholder="sensor" searchOnChange={true} queryFields={["sensor"]} />
                  <RefinementListFilter id="sensorKind" title="sensorKind" field="sensorKind.keyword" size={10} />
                  <HierarchicalMenuFilter fields={["sensor.keyword", "sensorKind.keyword"]} title="sensors" id="categories" />
                  <DynamicRangeFilter field="resolutionWidth" id="resolutionWidth" title="resolutionWidth" showHistogram={true}  /* rangeFormatter={(count)=> count + "*"} */ />
                  <RangeFilter min={12} max={768} field="resolutionHeight" id="resolutionHeight" title="width" showHistogram={true} />

                  <RefinementListFilter id="sensorKind" title="sensorKind" field="sensorKind.raw" size={10} />
                  <RefinementListFilter id="location" title="location" field="location.keyword" operator="OR" size={10} />
                  <NumericRefinementListFilter id="runtimeMinutes" title="Length" field="runtimeMinutes" options={[
                    { title: "All" },
                    { title: "up to 20", from: 0, to: 20 },
                    { title: "21 to 60", from: 21, to: 60 },
                    { title: "60 or more", from: 61, to: 1000 }
                  ]} />
                </SideBar>
                <LayoutResults>
                  <ActionBar>
                    <ActionBarRow>
                      <HitsStats translations={{
                        "hitstats.results_found": "{hitCount} results found"
                      }} />
                      <ViewSwitcherToggle />
                      <SortingSelector options={[
                        { label: "Relevance", field: "_score", order: "desc" },
                        { label: "sensors", field: "sensor", order: "desc" },
                        { label: "sensor kind", field: "sensorKind", order: "asc" }
                      ]} />
                    </ActionBarRow>
                    <ActionBarRow>
                      <GroupedSelectedFilters />
                      <ResetFilters />
                    </ActionBarRow>

                  </ActionBar>
                  <ViewSwitcherHits
                    hitsPerPage={12} highlightFields={["sensor", "sensorKind"]}
                    sourceFilter={["sensor", "sensorKind", "location", "resolutionHeight", "resolutionWidth", "image", "point"]}
                    //  sourceFilter={["plot", "title", "poster", "imdbId", "imdbRating", "year"]}
                    hitComponents={[
                      { key: "grid", title: "Grid", itemComponent: ImagesHitsGridItem, defaultOption: true },
                      { key: "list", title: "List", itemComponent: ImagesHitsListItem }
                    ]}
                    scrollTo="body"
                  />
                  <NoHits suggestionsField={"title"} />
                  <Pagination showNumbers={true} />
                </LayoutResults>
              </LayoutBody>
            </div>
            <div>
              {/*   <ReactMapGL style={{ margin: '15px' }} {...this.state.viewport} mapStyle={mapStyle} onViewportChange={(viewport) => this.setState({ viewport })}>
                {markers}
              </ReactMapGL> */}
              <GeoMap searchkit={searchkit} >
              {markers}
              </GeoMap>
            </div>
          </StyledDivFlex>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export default App;
