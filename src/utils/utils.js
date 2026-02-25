import dayjs from 'dayjs';
import { DATE_FORMAT, TIME_FORMAT } from '../const.js';

const getRandomArrayElement = (items) => items[Math.floor(Math.random() * items.length)];

const formatDate = (dateString, format) => dateString ? dayjs(dateString).format(format) : '';

const actualPointDate = (dateString) => formatDate(dateString, DATE_FORMAT);
const actualPointTime = (dateString) => formatDate(dateString, TIME_FORMAT);

const isPointExpired = (dateTo) => dateTo && dayjs().isAfter(dateTo, 'D');
const pointOffers = (offers) => Array.isArray(offers) && offers.length > 0;

const updateItem = (items, update) => {
  const index = items.findIndex((item) => item.id === update.id);
  if (index === -1) {
    return items;
  }

  return [
    ...items.slice(0, index),
    update,
    ...items.slice(index + 1)
  ];
};


export {
  getRandomArrayElement,
  actualPointDate,
  actualPointTime,
  isPointExpired,
  pointOffers,
  formatDate,
  updateItem
};


