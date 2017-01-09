'use strict';

// import fs and readline for laoding us-places.txt config
const fs = require('fs');
const readLine = require('readline');

// load US states, zip codes, and counties FIPS data config
const states = require('./resources/us-states.json');
// TODO: const zipCodes = require('./resources/us-zip-codes.json');
const counties = require('./resources/us-counties.json');

// import state, county, place model classes
const State = require('./state.js');
const County = require('./county.js');
const Place = require('./place.js');
const ZipCode = require('./zip-code.js');

/**
 * Defines location service api for validating 
 * US state, county, place, and zip code location queries.
 */
class LocationService {

  /**
  * Creates new LocationService service instance.
  *
  * Loads US states, counties, and places FIPS config data.
  */
  constructor() {
    // load states config data
    this._stateMap = new Map();
    this._stateNameMap = new Map();
    Object.keys(states).forEach( code => {
      let stateData = states[code];
      let state = new State(code, stateData.name, stateData.key);
      this._stateMap.set(state.key.toLowerCase(), state);
      this._stateNameMap.set(state.lowerCaseKey, state);
    });

    // TODO: load valid zip codes from ZCTA (ZIP Code Tabulation Areas) config data

    // load counties FIPS config data
    this._countyMap = new Map();
    this._countyMapList = new Map();
    Object.keys(counties).forEach( code => {
      let countyData = counties[code];
      let county = new County(code, countyData.name, countyData.state);
      this._countyMap.set(county.key, county);
      if ( !this._countyMapList.has(county.shortNameKey) ) {
        this._countyMapList.set(county.shortNameKey, []);
      }
      let countyList = this._countyMapList.get(county.shortNameKey);
      countyList.push(county);
    });

    // load US places: cities, towns, villages, etc.
    let placesCount = 0;
    this.places = new Map();    
    const placesConfig = readLine.createInterface({
      input: fs.createReadStream('./src/census/resources/us-places.txt', {flags:'r', autoClose: true}),
      terminal: false
    });

    placesConfig.on('line', (line) => {
      // create place tokens from place text line
      // example: IL|17|34722|Highland Park city|Incorporated Place|A|Lake County      
      let placeTokens = line.trim().split('|');
      if (placeTokens.length == 7) {
        // create new place info
        let place = new Place(
          placeTokens[2], // code
          placeTokens[3], // name
          placeTokens[0], // state
          placeTokens[6] // county
        );
        // add to loaded places
        this.places.set(place.key, place);
        placesCount++;
      }
    });

    placesConfig.on('close', () => {
      console.log(`LocationService(): loaded ${this.places.size} USA places.`);
    });

    console.log(`LocationService(): loaded ${this.states.size} USA states`,
      `and ${this.counties.size} counties.`);

  } // end of constructor()


  /*-------------------- Location Service Data Config Methods -----------------------*/

  /**
   * Gets loaded states map.
   */
  get states() {
    return this._stateMap;
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
    return this._countyMap;
  }


  /**
   * Gets county map list for county lookups without state code.
   */
  get countyMapList() {
    return this._countyMapList;
  }


  /*----------------- Location Service Region Validation Methods ---------------------*/

  /**
   * Checks if given region name is a valid state, county, or zip code.
   * 
   * @param regionName State name or code, zip code, or county name.
   */
  isValidRegion(regionName) {
    // use isValidState/ZipCode/County to check if given US geography exists
    return ( this.isValidState(regionName) ||
      this.isValidZipCode(regionName) ||
      this.isValidCounty(regionName) );
  }


  /**
   * Checks if given state exists.
   * 
   * @param stateName State name or code.
   */
  isValidState(stateName) {
    if (stateName === null || stateName === undefined) {
      return false;
    }

    // gen. lower case state key without white spaces
    const stateKey = stateName.toLowerCase().split(' ').join('');
    return ( this.states.has(stateKey) || this.stateNameMap.has(stateKey) );
  }


  /**
   * Checks if given zip code exitss.
   * 
   * @param zipCode 5 digit zip code.
   */
  isValidZipCode(zipCode) {
    if (zipCode === null || zipCode === undefined ||
      zipCode.length < 5 || isNaN(zipCode)) {
      return false; // not a valid zip code
    }
    
    // TODO: check against valid zip codes from ZCTA (ZIP Code Tabulation Areas) config data
    return true; // for now
  }


  /**
   * Checks if given county exists.
   * 
   * @param countyName County name string, with or without state name or code suffix.
   */
  isValidCounty(countyName) {
    if (countyName === null || countyName === undefined) {
      return false;
    }

    // gen. lower case county key without white spaces and 'county' suffix
    let countyKey = countyName.toLowerCase().split(' ').join('').replace('county', '');
    let countyStateKey = this.getCountyStateKey(countyKey);
    //console.log(`${countyKey} -> ${countyStateKey}`);
    return ( this.counties.has(countyKey) || 
      this.counties.has(countyStateKey) ||
      this.countyMapList.has(countyKey) ); 
  } 


  /**
   * Gets county,state.code key for [county],[state.name] strings.
   * 
   * @param countyStateString county,state.name key string, i.e. cook,illinois.
   * 
   * @return county,state.code key, i.e. cook,il.
   */
  getCountyStateKey(countyStateString) {
    // check for full state name suffix
    const countyTokens = countyStateString.split(',');
    if ( countyTokens.length > 1) {
      const countyKey = countyTokens[0];
      const stateName = countyTokens[countyTokens.length-1];
      //console.log(JSON.stringify(countyTokens));
      if ( this.stateNameMap.has(stateName) ) {
        const state = this.stateNameMap.get(stateName);        
        return `${countyKey},${state.key.toLowerCase()}`;
      }
    }
    return countyStateString;
  }


  /*----------------- Location Service Region Lookup Methods ---------------------*/

  /**
   * Gets region info the specified location string.
   * 
   * @param Location Location string.
   */
  getRegion(location) {
    if (!location || location.length < 2) {
      return null; // invalid location string
    }

    // gen. lower case region key without white spaces
    let regionKey = location.toLowerCase().split(' ').join('');

    // check states
    if ( this.states.has(regionKey) ) {
      return this.states.get(regionKey);
    }     
    if ( this.stateNameMap.has(regionKey) ) {
      return this.stateNameMap.get(regionKey);
    }

    // check places
    let placeKey = location.replace(' city', '')
      .replace(' town', '')
      .replace(' village', '')
      .replace(' CDP', '') // CDP - Census Designated Place
      .toLowerCase()
      .split(' ').join('');
    if (this.places.has(placeKey)) {
      return this.places.get(placeKey);
    }

    // check counties
    let countyKey = regionKey.replace('county', '');
    let countyStateKey = this.getCountyStateKey(countyKey);
    if ( this.counties.has(countyKey) ) {
      return this.counties.get(countyKey);
    }    
    if ( this.counties.has(countyStateKey) ) {
      return this.counties.get(countyStateKey);
    }
    if ( this.countyMapList.has(countyKey) ) {
      // return a list of matching counties
      return this.countyMapList.get(countyKey);
    }

    // TODO: check zip codes
    /*if ( this.isValidZipCode(regionKey) ) {
      // create and return numeric zip code for now
      // without checks against ZCTA config data
        return new ZipCode(regionKey);
    }*/
    
    // no valid US region info found
    return null;

  } // end of getRegion(location)


} // end of LocationService class


//export {LocationService as default}
// use old school for jest.js
exports["default"] = LocationService;
module.exports = exports["default"];
