import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';


const formatFilterLabel = (filterType) => filterType.charAt(0).toUpperCase() + filterType.slice(1);

const createSingleFilterTemplate = (filterData) => {
  const { type, count } = filterData;
  const labelText = formatFilterLabel(type);

  const isDisabled = count === 0 && type !== FilterType.EVERYTHING;
  const isChecked = type === FilterType.EVERYTHING;
  const counterText = type !== FilterType.EVERYTHING && count > 0 ? ` (${count})` : '';

  return `
    <div class="trip-filters__filter">
      <input
        id="filter-${type}"
        class="trip-filters__filter-input visually-hidden"
        type="radio"
        name="trip-filter"
        value="${type}"
        ${isDisabled ? 'disabled' : ''}
        ${isChecked ? 'checked' : ''}
      />
      <label class="trip-filters__filter-label" for="filter-${type}">
        ${labelText}${counterText}
      </label>
    </div>
  `;
};


const createFilterTemplate = (filtersData) => {

  const filtersHtml = filtersData.map((filter) => createSingleFilterTemplate(filter)).join('\n');
  return `
    <form class="trip-filters" action="#" method="get">
      ${filtersHtml}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
};

export default class FilterView extends AbstractView {
  #filtersData = null;
  constructor({ filters }) {
    super();
    this.#filtersData = filters;
  }

  get template() {
    return createFilterTemplate(this.#filtersData);
  }
}
