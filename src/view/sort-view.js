import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../const.js';


const formatSortLabel = (sortType) => sortType.charAt(0).toUpperCase() + sortType.slice(1);

const createSortItemTemplate = (sortItem) => {
  const { type } = sortItem;
  const labelText = formatSortLabel(type);

  const isAlwaysDisabled = type === SortType.EVENT || type === SortType.OFFERS;
  const isChecked = type === SortType.DAY;

  return `
    <div class="trip-sort__item trip-sort__item--${type}">
      <input
        id="sort-${type}"
        class="trip-sort__input visually-hidden"
        type="radio"
        name="trip-sort"
        value="${type}"
        ${isAlwaysDisabled ? 'disabled' : ''}
        ${isChecked ? 'checked' : ''}
      />
      <label class="trip-sort__btn" for="sort-${type}">${labelText}</label>
    </div>
  `;
};

const createSortTemplate = (sortData) => {
  const sortItemsHtml = sortData
    .map((item) => createSortItemTemplate(item))
    .join('\n');

  return `
    <form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${sortItemsHtml}
    </form>
  `;
};

export default class SortView extends AbstractView {
  #sortData = null;

  constructor({ sortData }) {
    super();
    this.#sortData = sortData;
  }

  get template() {
    return createSortTemplate(this.#sortData);
  }
}
