import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointModel from './model/point-model.js';
import FilterModel from './model/filter-model.js';
import CurrentFilterModel from './model/current-filter-model.js';

const tripInfoContainer = document.querySelector('.trip-main');
const filterContainer = document.querySelector('.trip-controls__filters');
const boardContainer = document.querySelector('.page-main .page-body__container');
const pointModel = new PointModel();
const filterModel = new FilterModel(pointModel.points);
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
  currentFilterModel
});

filterPresenter.init();
boardPresenter.init();
