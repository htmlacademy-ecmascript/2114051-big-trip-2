import { sortingMethods } from '../utils/sorting-helpers.js';
import { SortType } from '../const.js';

export default class SortModel {
  #sortItems = [];

  constructor(points) {
    this.updateSortItems(points);
  }

  updateSortItems(points) {
    this.#sortItems = Object.values(SortType).map((sortType) => {
      const sortFunction = sortingMethods[sortType];
      return {
        type: sortType,
        points: sortFunction ? sortFunction(points) : null
      };
    });
  }

  get sortItems() {
    return this.#sortItems;
  }
}
