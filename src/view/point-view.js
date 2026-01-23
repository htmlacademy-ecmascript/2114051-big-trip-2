import { createElement } from '../render';
import { actualPointDate, actualPointTime, isPointExpired, pointOffers } from '../utils.js';

const createPointTemplate = (point) => {

  const startDate = actualPointDate(point.dateFrom);
  const startTime = actualPointTime(point.dateFrom);
  const endTime = actualPointTime(point.dateTo);

  const expiredClassName = isPointExpired(point.dateTo) ? 'trip-event--expired' : '';
  const offersClassName = pointOffers(point.offers) ? 'event-offers' : '';
  const favoriteBtnClassName = point.isFavorite ? 'event__favorite-btn--active' : '';

  return `<li class="trip-events__item ${expiredClassName} ${offersClassName}">
    <div class="event">
      <time class="event__date" datetime="${point.dateFrom}">${startDate}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${point.type}.png" alt="${point.type} icon">
      </div>
      <h3 class="event__title">${point.type} Amsterdam</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${point.dateFrom}">${startTime}</time>
          &mdash;
          <time class="event__end-time" datetime="${point.dateTo}">${endTime}</time>
        </p>
        <p class="event__duration">30M</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">20</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">
        <li class="event__offer">
          <span class="event__offer-title">Order Uber</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${point.basePrice}</span>
        </li>
      </ul>
      <button class="event__favorite-btn ${favoriteBtnClassName}" type="button">
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>`;
};

export default class PointView {
  constructor(point) {
    this.point = point;
  }

  getTemplate() {
    return createPointTemplate(this.point);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
