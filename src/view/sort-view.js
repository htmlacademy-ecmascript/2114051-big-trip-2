import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../const.js';

const formatSortLabel = (sortType) => sortType.charAt(0).toUpperCase() + sortType.slice(1);

const createSortItemTemplate = (sortItem, currentSortType) => {
  const { type } = sortItem;
  const labelText = formatSortLabel(type);
  const isAlwaysDisabled = type === SortType.EVENT || type === SortType.OFFERS;
  const isChecked = type === currentSortType;

  return `
    <div class="trip-sort__item trip-sort__item--${type}">
      <input
        id="sort-${type}"
        class="trip-sort__input visually-hidden"
        type="radio"
        name="trip-sort"
        value="${type}"
        data-sort-type="${type}"
        ${isAlwaysDisabled ? 'disabled' : ''}
        ${isChecked ? 'checked' : ''}
      />
      <label class="trip-sort__btn" for="sort-${type}">${labelText}</label>
    </div>
  `;
};


const createSortTemplate = (sortData, currentSortType) => {
  const sortItemsHtml = sortData
    .map((item) => createSortItemTemplate(item, currentSortType))
    .join('\n');

  return `
    <form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${sortItemsHtml}
    </form>
  `;
};

export default class SortView extends AbstractView {
  #sortData = null;
  #currentSortType = null;
  #handleSortTypeChange = null;

  constructor({ sortData, currentSortType, onSortTypeChange }) {
    super();
    this.#sortData = sortData;
    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;
    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#sortData, this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }

    evt.preventDefault();

    const inputId = evt.target.getAttribute('for');
    const input = document.getElementById(inputId);

    if (input) {
      const sortType = input.dataset.sortType;
      this.#handleSortTypeChange(sortType);
    }
  };
}
