'use strict';

const Region = require('./region.js');

/**
 * Defines US county with 5 digit FIPS code,
 * county name and state for county census data lookups.
 */
class County extends Region {

  /**
  * Creates new County class instance.
  *
  * @param code 5 digit FIPS code.
  * @param name County name.
  * @param state County state code.
  *
  * @see https://en.wikipedia.org/wiki/FIPS_county_code
  */
  constructor(code, name, state) {
    super(code, name);
    this.state = state;
    this.type = 'county';
  }


  /**
   * Gets short county name key, without state,
   * for counties lookup without state code.
   */
  get shortNameKey() {
    // strip out 'county'
    return this.lowerCaseKey.replace('county', '');
  }


  /**
   * Gets county key with state code
   * for lookups and county query validation.
   * 
   * Example: 'Cook County, IL' => 'cook,IL'
   */
  get key() {
    return `${this.shortNameKey},${this.state.toLowerCase()}`;
  }


  /**
   * @return Returns county name and state abbreviation.
   */
  toString() {
    return `${this.name}, ${this.state}`;
  }

} 

module.exports = County;
