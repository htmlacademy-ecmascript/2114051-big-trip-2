import dayjs from 'dayjs';

const getTripTitle = (points, destinations) => {
  if (!points || points.length === 0) {
    return '';
  }

  const sortedPoints = [...points].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));

  const cityNames = [];
  for (const point of sortedPoints) {
    const destination = destinations.find((dest) => dest.id === point.destination);
    if (destination && !cityNames.includes(destination.name)) {
      cityNames.push(destination.name);
    }
  }

  if (cityNames.length === 0) {
    return '';
  }

  if (cityNames.length > 3) {
    return `${cityNames[0]} — ... — ${cityNames[cityNames.length - 1]}`;
  }

  return cityNames.join(' — ');
};

const getTripDates = (points) => {
  if (!points || points.length === 0) {
    return '';
  }

  const sortedPoints = [...points].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
  const startDate = dayjs(sortedPoints[0].dateFrom);
  const endDate = dayjs(sortedPoints[sortedPoints.length - 1].dateTo);
  const startFormat = startDate.format('MMM D');
  const endFormat = endDate.format('MMM D');

  if (startDate.month() === endDate.month() && startDate.year() === endDate.year()) {
    return `${startFormat} — ${endFormat}`;
  }

  return `${startDate.format('MMM D')} — ${endDate.format('MMM D')}`;
};

const getTotalCost = (points, offers) => {
  if (!points || points.length === 0) {
    return 0;
  }

  let total = 0;

  for (const point of points) {

    total += point.basePrice;

    if (point.offers && point.offers.length > 0) {
      const offersForType = offers.find((offerGroup) => offerGroup.type === point.type);
      if (offersForType) {
        for (const offerId of point.offers) {
          const offer = offersForType.offers.find((o) => o.id === offerId);
          if (offer) {
            total += offer.price;
          }
        }
      }
    }
  }

  return total;
};

export { getTripTitle, getTripDates, getTotalCost };
