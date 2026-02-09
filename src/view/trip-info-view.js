import AbstractView from '../framework/view/abstract-view.js';

const createInfoTemplate = (tripInfo) => {
  const { title, dates, totalCost } = tripInfo;

  return `
    <section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${title}</h1>
        <p class="trip-info__dates">${dates}</p>
      </div>
      <p class="trip-info__cost">Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span></p>
    </section>
  `;
};

export default class TripInfoView extends AbstractView {
  #tripInfo = null;

  constructor({ tripInfo }) {
    super();
    this.#tripInfo = tripInfo;
  }

  get template() {
    return createInfoTemplate(this.#tripInfo);
  }
}

