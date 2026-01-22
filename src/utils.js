import dayjs from 'dayjs';
import { DATE_FORMAT, TIME_FORMAT } from './const.js';

const getRandomArrayElement = (items) => items[Math.floor(Math.random() * items.length)];

const formatDate = (dateString, format) => dateString ? dayjs(dateString).format(format) : '';

const actualPointDate = (dateString) => formatDate(dateString, DATE_FORMAT);
const actualPointTime = (dateString) => formatDate(dateString, TIME_FORMAT);

export {
  getRandomArrayElement,
  actualPointDate,
  actualPointTime
};
