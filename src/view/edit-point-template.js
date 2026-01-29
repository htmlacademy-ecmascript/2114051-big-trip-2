import { formatDate } from '../utils.js';
import { POINT_TYPES } from '../const.js';

const createPointTimeTemplate = (dateFrom, dateTo) => `
    <div class="event__field-group  event__field-group--time">
      <label class="visually-hidden" for="event-start-time-1">From</label>
      <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${ (dateFrom && dateTo) ? formatDate(dateFrom, 'DD/MM/YY HH:mm') : '' }">
      &mdash;
      <label class="visually-hidden" for="event-end-time-1">To</label>
      <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${ (dateTo && dateFrom) ? formatDate(dateTo, 'DD/MM/YY HH:mm') : '' }">
    </div>
  `;

const createPointTypeTemplate = () => {
  let html = '';

  for (let i = 0; i < POINT_TYPES.length; i++) {
    const type = POINT_TYPES[i];
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);

    html += `
    <div class="event__type-item">
      <input id="event-type-${type}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${type === 'flight' ? 'checked' : ''}>
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">${typeName}</label>
    </div>`;
  }

  return `
    <div class="event__type-list">
      <fieldset class="event__type-group">
        <legend class="visually-hidden">Event type</legend>
        ${html}
      </fieldset>
    </div>
  `;
};

const createPointDestinationTemplate = (destination, pointType) => {
  if (destination) {
    const destinationName = destination.name || '';
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
  }
  return '';
};

export const createEditPointTemplate = (point) => {
  const { type, dateFrom, dateTo, destination } = point;
  const typeListTemplate = createPointTypeTemplate();
  const timeTemplate = createPointTimeTemplate(dateFrom, dateTo);
  const destinationTemplate = createPointDestinationTemplate(destination, type);

  return `<li class="trip-events__item">
    <form class="event event--edit">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${type || 'bus'}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">

          <!-- ВСТАВЛЯЕМ здесь результат работы функции -->
          ${typeListTemplate}

        </div>
          ${destinationTemplate}
          ${timeTemplate}
        <!-- Другие поля формы -->
      </header>
    </form>
  </li>`;
};
