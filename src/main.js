import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointModel from './model/point-model.js';
import FilterModel from './model/filter-model.js';
import CurrentFilterModel from './model/current-filter-model.js';
import ApiService from './framework/api-service.js';


const AUTHORIZATION = 'Basic hso2iw399sk38d';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const apiService = new ApiService(END_POINT, AUTHORIZATION);

const tripInfoContainer = document.querySelector('.trip-main');
const filterContainer = document.querySelector('.trip-controls__filters');
const boardContainer = document.querySelector('.page-main .page-body__container');
const newEventButton = document.querySelector('.trip-main__event-add-btn');

const pointModel = new PointModel({
  pointsApiService: apiService
});

const filterModel = new FilterModel([]);
const currentFilterModel = new CurrentFilterModel();

const filterPresenter = new FilterPresenter({
  filterContainer,
  filterModel: currentFilterModel,
  pointsModel: pointModel
});

const boardPresenter = new BoardPresenter({
  boardContainer,
  tripInfoContainer,
  filterContainer,
  pointModel,
  filterModel,
  currentFilterModel,
  newEventButton,
  filterPresenter
});

newEventButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  boardPresenter.createPoint();
});

newEventButton.disabled = true;

filterPresenter.init();
boardPresenter.init();

pointModel.init()
  .then(() => {
    newEventButton.disabled = false;
  })
  .catch(() => {
    newEventButton.disabled = true;
    filterPresenter.setFiltersDisabled(true);
  });
