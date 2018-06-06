import React, { Component } from 'react'
import extend from 'lodash/extend'
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


import './index.css'
import 'bootstrap/dist/css/bootstrap.css';
import styled from "styled-components";
//const host = "http://demo.searchkit.co/api/movies"
//const host ="http://elastic:MagicWord@localhost:9200/image"
const host = "http://localhost:9200/image"
const searchkit = new SearchkitManager(host, { basicAuth: "elastic:MagicWord" })

const MovieHitsGridItem = (props) => {
  /*   const {sensor, sensorKind} = props
    let url = "http://www.imdb.com/title/" + result._source.imdbId
    const source = extend({}, result._source, result.highlight)
    return (
      <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
  
        <a href={url} target="_blank">
          <img data-qa="poster" alt="presentation" className={bemBlocks.item("poster")} src={result._source.poster} width="170" height="240"/>
          <div data-qa="title" className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.title}}></div>
        </a>
      </div>
    ) */
}

const StyledDiv = styled.div`
margin-left: 30px;
`
  ;

const ImagesHitsListItem = (props) => {
  const { sensorKind, sensor, resolutionWidth, resolutionHeight, location, image } = props.result._source
  const { bemBlocks } = props;
  /*  let url = "http://www.imdb.com/title/" + result._source.imdbId */
  /*  const source = extend({}, result._source, result.highlight) */
 /*  return (


    <div style={{ width: "95%", boxShadow: "2px 2px 2px 2px rgba(175, 163, 163, 0.25)", marginTop: "15px" }}>
      <Card style={{ height: "200px" }}>
        <CardBody style={{ display: "flex", flexDirection: 'row' }}>
          <CardImg style={{ width: "150px", height: "160px" }} alt="presentation" src={image} alt="Card image cap" />
          <StyledDiv>
            <CardTitle>{sensor}     ({resolutionWidth}x{resolutionHeight})</CardTitle>
            <CardSubtitle>{sensorKind}</CardSubtitle>
            <CardText>{location}</CardText>
            <Button color="success">Map</Button>
          </StyledDiv>
        </CardBody>
      </Card>
    </div>) */
    return (
      <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
        <div className={bemBlocks.item("poster")}>
          <img data-qa="poster" src={image}/>
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
  /*  let url = "http://www.imdb.com/title/" + result._source.imdbId */
  /*  const source = extend({}, result._source, result.highlight) */
  /*  return (
  
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
    <div data-qa="hit"  style={{ boxShadow:"2px 2px 2px 2px rgba(175, 163, 163, 0.25)",margin:"15px"}} >
    <Card style={{border:""}} >
      <CardBody  >
        <CardImg   alt="presentation" src={image} alt="Card image cap" />
        <StyledDiv>
          <CardTitle>{sensor}     ({resolutionWidth}x{resolutionHeight})</CardTitle>
          <CardSubtitle>{sensorKind}</CardSubtitle>
          <CardText>{location}</CardText>
          <Button color="success">Map</Button>
        </StyledDiv>
      </CardBody>
    </Card>
  </div>
  </div>
  ) */


  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">

      <a target="_blank">
        <img data-qa="poster" alt="presentation" className={bemBlocks.item("poster")} src={image} width="170" height="240" />
        <div data-qa="title" className={bemBlocks.item("title")}>{sensor}</div>
        <div data-qa="title" className={bemBlocks.item("subtitle")}>{sensorKind}</div>
      </a>
    </div>
  )

}


class App extends Component {
  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout  size="l"  >
          <TopBar>
            <div className="my-logo">IndexR</div>
            <SearchBox autofocus={true} searchOnChange={true} prefixQueryFields={["sensor^1", "sensorKind^2", "location"]} />
          </TopBar>
          <LayoutBody>
            <SideBar>
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
                sourceFilter={["sensor", "sensorKind", "location", "resolutionHeight", "resolutionWidth", "image"]}
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
        </Layout>
      </SearchkitProvider>
    );
  }
}

export default App;
