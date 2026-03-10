import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { DATE_FORMAT, TIME_FORMAT } from '../const.js';

dayjs.extend(duration);

const formatDate = (date, format) => {
  if (!date) {
    return '';
  }
  return dayjs(date).format(format);
};

const formatFullDate = (date) => formatDate(date, DATE_FORMAT);
const formatTime = (date) => formatDate(date, TIME_FORMAT);

const calculateDuration = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) {
    return 0;
  }
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  return end.diff(start);
};

const formatDuration = (milliseconds) => {
  const durationObj = dayjs.duration(milliseconds);
  const days = durationObj.days();
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();

  let result = '';

  if (days > 0) {
    result += `${days.toString().padStart(2, '0')}D `;
  }

  if (hours > 0 || days > 0) {
    result += `${hours.toString().padStart(2, '0')}H `;
  }

  result += `${minutes.toString().padStart(2, '0')}M`;
  return result.trim();
};

const isPointExpired = (dateTo) => {
  if (!dateTo) {
    return false;
  }
  return dayjs().isAfter(dateTo, 'day');
};

export {
  formatDate,
  formatFullDate,
  formatTime,
  calculateDuration,
  formatDuration,
  isPointExpired
};
