import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);


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

export { calculateDuration, formatDuration };
