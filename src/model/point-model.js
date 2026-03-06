import Observable from '../framework/observable.js';
import { getRandomDestinations, getDestinationById } from '../mock/mock-destinations.js';
import { getRandomOffers, getOffersByType } from '../mock/mock-offers.js';
import { getRoutePoints } from '../mock/mock-route-points.js';
import { POINT_COUNT } from '../const.js';

export default class PointModel extends Observable {
  #points = Array.from({length: POINT_COUNT}, getRoutePoints);
  #offers = getRandomOffers();
  #destinations = getRandomDestinations();

  get points() {
    return this.#points;
  }

  updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      update,
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  addPoint(updateType, update) {
    this.#points = [
      update,
      ...this.#points,
    ];

    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType);
  }

  getFullPointInfo(point) {
    if (!point) {
      return null;
    }

    const cityInfo = getDestinationById(point.destination);
    const allOffersForType = getOffersByType(point.type);
    const selectedOffers = [];

    for (const offerId of point.offers) {
      const foundOffer = allOffersForType.find((offer) => offer.id === offerId);
      if (foundOffer) {
        selectedOffers.push(foundOffer);
      }
    }

    return {
      ...point,
      destination: cityInfo,
      offers: selectedOffers
    };
  }
}
