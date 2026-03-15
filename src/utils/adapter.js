export const adaptPointToClient = (point) => {
  const adaptedPoint = {
    ...point,
    basePrice: point['base_price'],
    dateFrom: point['date_from'] ? new Date(point['date_from']) : null,
    dateTo: point['date_to'] ? new Date(point['date_to']) : null,
    isFavorite: point['is_favorite'],
    offers: point['offers'] || []
  };

  delete adaptedPoint['base_price'];
  delete adaptedPoint['date_from'];
  delete adaptedPoint['date_to'];
  delete adaptedPoint['is_favorite'];

  return adaptedPoint;
};

export const adaptPointToServer = (point) => {
  const adaptedPoint = {
    'base_price': point.basePrice,
    'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : null,
    'date_to': point.dateTo instanceof Date ? point.dateTo.toISOString() : null,
    'destination': null,
    'is_favorite': point.isFavorite || false,
    'offers': [],
    'type': point.type
  };

  if (point.destination) {
    if (typeof point.destination === 'object') {
      adaptedPoint.destination = point.destination.id || point.destination;
    } else {
      adaptedPoint.destination = point.destination;
    }
  }

  if (point.offers && Array.isArray(point.offers)) {
    adaptedPoint.offers = point.offers.map((offer) => {
      if (typeof offer === 'object') {
        return offer.id;
      }
      return offer;
    });
  }

  return adaptedPoint;
};

export const adaptDestinationToClient = (destination) => destination;
export const adaptOffersToClient = (offers) => offers;
