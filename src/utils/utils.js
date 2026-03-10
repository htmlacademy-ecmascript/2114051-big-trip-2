import { formatDate, isPointExpired } from './date-utils.js';

const getRandomArrayElement = (items) => items[Math.floor(Math.random() * items.length)];
const actualPointDate = (dateString) => formatDate(dateString, 'MMM DD');
const actualPointTime = (dateString) => formatDate(dateString, 'HH:mm');
const pointOffers = (offers) => Array.isArray(offers) && offers.length > 0;

export {
  getRandomArrayElement,
  actualPointDate,
  actualPointTime,
  isPointExpired,
  pointOffers,
  formatDate
};
