const POINT_COUNT = 8;
const DATE_FORMAT = 'MMM DD';
const TIME_FORMAT = 'HH:mm';

const BLANK_POINT = {
  basePrice: 0,
  dateFrom: null,
  dateTo: null,
  destination: null,
  isFavorite: false,
  offers: [],
  type: 'flight'
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price'
};

export {
  POINT_COUNT,
  DATE_FORMAT,
  TIME_FORMAT,
  BLANK_POINT,
  FilterType,
  SortType
};
