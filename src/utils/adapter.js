export const adaptToClient = (point) => {
  const adaptedPoint = {
    ...point,
    basePrice: point['base_price'],
    dateFrom: point['date_from'] ? new Date(point['date_from']) : null,
    dateTo: point['date_to'] ? new Date(point['date_to']) : null,
    isFavorite: point['is_favorite'],
  };

  delete adaptedPoint['base_price'];
  delete adaptedPoint['date_from'];
  delete adaptedPoint['date_to'];
  delete adaptedPoint['is_favorite'];

  return adaptedPoint;
};


export const adaptToServer = (point) => {
  const adaptedPoint = {
    ...point,
    'base_price': point.basePrice,
    'date_from': point.dateFrom ? point.dateFrom.toISOString() : null,
    'date_to': point.dateTo ? point.dateTo.toISOString() : null,
    'is_favorite': point.isFavorite,
  };

  delete adaptedPoint.basePrice;
  delete adaptedPoint.dateFrom;
  delete adaptedPoint.dateTo;
  delete adaptedPoint.isFavorite;

  return adaptedPoint;
};


export const adaptDestinationToClient = (destination) => destination;
export const adaptOffersToClient = (offers) => offers;
