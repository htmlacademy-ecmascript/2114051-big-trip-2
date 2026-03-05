import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

const formatFilterLabel = (filterType) => filterType.charAt(0).toUpperCase() + filterType.slice(1);

const createSingleFilterTemplate = (filterData, currentFilterType) => {
  const { type, count } = filterData;
  const labelText = formatFilterLabel(type);

  const isDisabled = count === 0 && type !== FilterType.EVERYTHING;
  const isChecked = type === currentFilterType;
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

const createFilterTemplate = (filtersData, currentFilterType) => {
  const filtersHtml = filtersData
    .map((filter) => createSingleFilterTemplate(filter, currentFilterType))
    .join('\n');
  return `
    <form class="trip-filters" action="#" method="get">
      ${filtersHtml}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
};

export default class FilterView extends AbstractView {
  #filtersData = null;
  #currentFilterType = null;
  #handleFilterTypeChange = null;

  constructor({ filters, currentFilterType, onFilterTypeChange }) {
    super();
    this.#filtersData = filters;
    this.#currentFilterType = currentFilterType;
    this.#handleFilterTypeChange = onFilterTypeChange;

    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#filtersData, this.#currentFilterType);
  }

  #filterTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterTypeChange(evt.target.value);
  };
}
