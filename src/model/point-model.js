import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

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

      this.#points = points.map(this.#adaptToClient);
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
      const updatedPoint = this.#adaptToClient(response);

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
      const newPoint = this.#adaptToClient(response);

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

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
      isFavorite: point['is_favorite'],
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
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
