import { filterFunctions } from '../utils/filter-utils.js';
import { FilterType } from '../const.js';

export default class FilterModel {
  #filters = [];

  constructor(points) {
    this.updateFilters(points);
  }

  updateFilters(points) {
    this.#filters = Object.values(FilterType).map((filterType) => ({
      type: filterType,
      count: filterFunctions[filterType](points).length
    }));
  }

  get filters() {
    return this.#filters;
  }
}
