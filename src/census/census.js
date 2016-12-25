'use strict';

// load US states, zip codes, and counties FIPS data config
const states = require('./resources/us-states.json');
// TODO: const zipCodes = require('./resources/us-zip-codes.json');
const counties = require('./resources/us-counties.json');

// import State, ZipCode, and County model classes
const State = require('./state.js');
// TODO: const ZipCode = require('./zip-code.js');
const County = require('./county.js');

/**
 * Defines top-level Census data service api for getting US pop,
 * biz, trade, incomes, and housing data stats.  
 */
class Census {

  /**
  * Creates new Census data service instance.
  *
  * Loads US states, zip codes, and counties FIPS data config.
  *
  * @param config Census data service config.
  */
  constructor(config) {
    // save config
    this._config = config;

    // load states FIPS data
    const stateMap = new Map();
    const stateNameMap = new Map();
    Object.keys(states).forEach( code => {
      let state = new State(code, states[code]);
      stateMap.set(code, state);
      stateNameMap.set(state.name, state);
    });
    this._states = stateMap;
    this._stateNameMap = stateNameMap;

    // TODO: load zip codes Fips data

    // load counties FIPS data
    const countyMap = new Map();
    const countyMapList = new Map();
    Object.keys(counties).forEach( code => {
      let countyData = counties[code];
      let county = new County(code, countyData.name, countyData.state);
      countyMap.set(county.key, county);
      // update matching county without state code map list
      if ( !countyMapList.has(county.shortNameKey) ) {
        countyMapList.set(county.shortNameKey, []);
      }
      let countyList = countyMapList.get(county.shortNameKey);
      countyList.push(county);
    });
    this._counties = countyMap;
    this._countyMapList = countyMapList;

    console.log(`Census(): loaded ${this.states.size} states and ${this.counties.size} US counties`);

  } // end of constructor()


  /*-------------------- Census Data Service Config Methods ---------------------------*/

  /**
   * Gets Census data service config.
   */
  get config() {
    return this._config;
  }


  /**
   * Gets loaded states map.
   */
  get states() {
    return this._states;
  }


  /**
   * Gets state name map.
   */
  get stateNameMap() {
    return this._stateNameMap;
  }


  /**
   * Gets loaded counties map.
   */
  get counties() {
    return this._counties;
  }


  /**
   * Gets county map list for county lookups without state code.
   */
  get countyMapList() {
    return this._countyMapList;
  }


  /*----------------- Census Data Service Region Validation Methods -------------------*/

  /**
   * Checks if given region name is a valid state, county, or zip code.
   * 
   * @param regionName State name or code, zip code, or county name.
   */
  isValidRegion(regionName) {
    // TODO: use isValidState/ZipCode/County to check if given US geography exists
  }


  /**
   * Checks if given state exists.
   * 
   * @param stateName State name or code.
   */
  isValidState(stateName) {
    // TODO
  }


  /**
   * Checks if given zip code exits.
   * 
   * @param zipCode 5 digit zip code.
   */
  isValidZipCode(zipCode) {
    // TODO
  }


  /**
   * Checks if given county exists.
   */
  isValidCounty(countyName) {
    // TODO
  }


  /*---------------------- Census Data Service API Methods ----------------------------*/

  /**
   * Gets US population stats.
   * 
   * @param location US location: state, county, zip or USA (default).
   */
  getPopulation(location) {
    console.log(`Census:getPopulation(): location=${location}`);
    // TODO
  }

} // end of Census class

//export {Census as default}
// use old school for jest.js
exports["default"] = Census;
module.exports = exports["default"];
