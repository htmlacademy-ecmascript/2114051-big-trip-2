import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { BLANK_POINT } from '../const.js';
import { formatDate } from '../utils/utils.js';

const createPointTimeTemplate = (dateFrom, dateTo) => `
    <div class="event__field-group  event__field-group--time">
      <label class="visually-hidden" for="event-start-time-1">From</label>
      <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${ (dateFrom && dateTo) ? formatDate(dateFrom, 'DD/MM/YY HH:mm') : '' }">
      &mdash;
      <label class="visually-hidden" for="event-end-time-1">To</label>
      <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${ (dateTo && dateFrom) ? formatDate(dateTo, 'DD/MM/YY HH:mm') : '' }">
    </div>
  `;

const createPointTypeTemplate = (currentType) => `<div class="event__type-list">
      <fieldset class="event__type-group">
        <legend class="visually-hidden">Event type</legend>
        <div class="event__type-item">
          <input id="event-type-taxi-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="taxi" ${currentType === 'taxi' ? 'checked' : ''}>
          <label class="event__type-label event__type-label--taxi" for="event-type-taxi-1">Taxi</label>
        </div>
        <div class="event__type-item">
          <input id="event-type-bus-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="bus" ${currentType === 'bus' ? 'checked' : ''}>
          <label class="event__type-label event__type-label--bus" for="event-type-bus-1">Bus</label>
        </div>
        <div class="event__type-item">
          <input id="event-type-train-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="train" ${currentType === 'train' ? 'checked' : ''}>
          <label class="event__type-label event__type-label--train" for="event-type-train-1">Train</label>
        </div>
        <div class="event__type-item">
          <input id="event-type-ship-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="ship" ${currentType === 'ship' ? 'checked' : ''}>
          <label class="event__type-label event__type-label--ship" for="event-type-ship-1">Ship</label>
        </div>
        <div class="event__type-item">
          <input id="event-type-drive-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="drive" ${currentType === 'drive' ? 'checked' : ''}>
          <label class="event__type-label event__type-label--drive" for="event-type-drive-1">Drive</label>
        </div>
        <div class="event__type-item">
          <input id="event-type-flight-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="flight" ${currentType === 'flight' ? 'checked' : ''}>
          <label class="event__type-label event__type-label--flight" for="event-type-flight-1">Flight</label>
        </div>
        <div class="event__type-item">
          <input id="event-type-check-in-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="check-in" ${currentType === 'check-in' ? 'checked' : ''}>
          <label class="event__type-label event__type-label--check-in" for="event-type-check-in-1">Check-in</label>
        </div>
        <div class="event__type-item">
          <input id="event-type-sightseeing-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="sightseeing" ${currentType === 'sightseeing' ? 'checked' : ''}>
          <label class="event__type-label event__type-label--sightseeing" for="event-type-sightseeing-1">Sightseeing</label>
        </div>
        <div class="event__type-item">
          <input id="event-type-restaurant-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="restaurant" ${currentType === 'restaurant' ? 'checked' : ''}>
          <label class="event__type-label event__type-label--restaurant" for="event-type-restaurant-1">Restaurant</label>
        </div>
      </fieldset>
    </div>
  `;

const createPointDestinationDetailsTemplate = (destination) => {
  if (!destination || !destination.description) {
    return '';
  }

  return `
    <section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destination.description}</p>
    </section>
  `;
};

const createPointDestinationTemplate = (destination, pointType) => {
  const destinationName = destination?.name || '';
  const typeLabel = pointType ? pointType.charAt(0).toUpperCase() + pointType.slice(1) : 'Bus';

  return `
    <div class="event__field-group  event__field-group--destination">
      <label class="event__label  event__type-output" for="event-destination-1">
        ${typeLabel}
      </label>
      <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
      <datalist id="destination-list-1">
        <option value="Amsterdam"></option>
        <option value="Geneva"></option>
        <option value="Chamonix"></option>
      </datalist>
    </div>
  `;
};

function createEditPointTemplate(state) {
  const { type, dateFrom, dateTo, destination, basePrice, isTypeListOpen, isDestinationOpen } = state;
  const typeListTemplate = isTypeListOpen ? createPointTypeTemplate(type) : '';
  const destinationDetailsTemplate = isDestinationOpen && destination?.description ? createPointDestinationDetailsTemplate(destination) : '';
  const timeTemplate = createPointTimeTemplate(dateFrom, dateTo);
  const destinationTemplate = createPointDestinationTemplate(destination, type);

  return `<li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type || 'bus'}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox" ${isTypeListOpen ? 'checked' : ''}>

          ${typeListTemplate}

        </div>

          ${destinationTemplate}
          ${timeTemplate}

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn btn" type="reset">Delete</button>

          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Close event</span>
          </button>
      </header>
      ${destinationDetailsTemplate}
    </form>
  </li>`;
}

export default class EditPointView extends AbstractStatefulView {
  #handleFormSubmit = null;
  #handleDeleteClick = null;
  #handleCloseClick = null;

  constructor({point = BLANK_POINT, onFormSubmit, onDeleteClick, onCloseClick}) {
    super();
    this._setState(EditPointView.parsePointToState(point));
    this.#handleFormSubmit = onFormSubmit;
    this.#handleDeleteClick = onDeleteClick;
    this.#handleCloseClick = onCloseClick;

    this._restoreHandlers();
  }

  get template() {
    return createEditPointTemplate(this._state);
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#closeClickHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
    this.element.querySelector('.event__type-toggle').addEventListener('click', this.#typeToggleHandler);

    this.element.querySelectorAll('.event__type-input').forEach((input) => {
      input.addEventListener('change', this.#typeChangeHandler);
    });

    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(EditPointView.parseStateToPoint(this._state));
  };

  #closeClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick();
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick();
  };

  #typeToggleHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      isTypeListOpen: !this._state.isTypeListOpen
    });
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    const newType = evt.target.value;
    this.updateElement({
      type: newType,
      isTypeListOpen: false
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const destinationName = evt.target.value;

    this.updateElement({
      destination: {
        name: destinationName,
        description: 'Chamonix, is a beautiful city, a true asian pearl, with crowded streets.'
      },
      isDestinationOpen: true
    });
  };

  static parsePointToState(point) {
    return {
      ...point,
      isTypeListOpen: false,
      isDestinationOpen: false
    };
  }

  static parseStateToPoint(state) {
    const point = { ...state };
    delete point.isTypeListOpen;
    delete point.isDestinationOpen;
    return point;
  }
}
