export default class ApiService {
  constructor(endPoint, authorization) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  get points() {
    return this._load({ url: 'points' })
      .then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({ url: 'destinations' })
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({ url: 'offers' })
      .then(ApiService.parseResponse);
  }

  async updatePoint(point) {
    const adaptedPoint = this.#adaptToServer(point);

    const response = await this._load({
      url: `points/${point.id}`,
      method: 'PUT',
      body: JSON.stringify(adaptedPoint),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);
    return parsedResponse;
  }

  async addPoint(point) {
    const adaptedPoint = this.#adaptToServer(point);

    const response = await this._load({
      url: 'points',
      method: 'POST',
      body: JSON.stringify(adaptedPoint),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);
    return parsedResponse;
  }

  async deletePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: 'DELETE',
    });

    return response;
  }

  #adaptToServer(point) {
    if (!point || typeof point !== 'object') {
      return {};
    }

    const adaptedPoint = {
      'base_price': Number(point.basePrice) || 0,
      'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : null,
      'date_to': point.dateTo instanceof Date ? point.dateTo.toISOString() : null,
      'destination': null,
      'is_favorite': Boolean(point.isFavorite),
      'offers': [],
      'type': point.type || 'flight'
    };

    if (point.destination) {
      if (typeof point.destination === 'object') {
        adaptedPoint.destination = point.destination.id || null;
      } else {
        adaptedPoint.destination = point.destination;
      }
    }

    if (point.offers && Array.isArray(point.offers)) {
      adaptedPoint.offers = point.offers.map((offer) => {
        if (typeof offer === 'object' && offer.id) {
          return offer.id;
        }
        return offer;
      });
    }

    return adaptedPoint;
  }

  async _load({
    url,
    method = 'GET',
    body = null,
    headers = new Headers(),
  }) {
    headers.append('Authorization', this._authorization);

    const response = await fetch(
      `${this._endPoint}/${url}`,
      { method, body, headers },
    );

    try {
      ApiService.checkStatus(response);
      return response;
    } catch (err) {
      ApiService.catchError(err);
    }
  }

  static parseResponse(response) {
    return response.json();
  }

  static checkStatus(response) {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  }

  static catchError(err) {
    throw err;
  }
}
