import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';
import { adaptPointToClient } from '../utils/adapter.js';

export default class PointModel extends Observable {
  #points = [];
  #destinations = [];
  #offers = [];
  #pointsApiService = null;

  constructor({ pointsApiService }) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  async init() {
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#pointsApiService.points,
        this.#pointsApiService.destinations,
        this.#pointsApiService.offers
      ]);

      this.#points = points.map(adaptPointToClient);
      this.#destinations = destinations;
      this.#offers = offers;

      this._notify(UpdateType.INIT);
    } catch(err) {
      this.#points = [];
      this.#destinations = [];
      this.#offers = [];

      this._notify(UpdateType.INIT);
    }
  }

  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = adaptPointToClient(response);

      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1),
      ];

      this._notify(updateType, updatedPoint);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#pointsApiService.addPoint(update);
      const newPoint = adaptPointToClient(response);

      this.#points = [
        newPoint,
        ...this.#points,
      ];

      this._notify(updateType, newPoint);
    } catch(err) {
      throw new Error('Can\'t add point');
    }
  }

  async deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    try {
      await this.#pointsApiService.deletePoint(update);

      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1),
      ];

      this._notify(updateType);
    } catch(err) {
      throw new Error('Can\'t delete point');
    }
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  getOffersByType(type) {
    const offerGroup = this.#offers.find((group) => group.type === type);
    return offerGroup ? offerGroup.offers : [];
  }

  getFullPointInfo(point) {
    if (!point) {
      return null;
    }

    const cityInfo = this.getDestinationById(point.destination);
    const allOffersForType = this.getOffersByType(point.type);
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
