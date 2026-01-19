import BoardPresenter from './presenter/board-presenter.js';

const tripInfoContainer = document.querySelector('.trip-main');
const filterContainer = document.querySelector('.trip-controls__filters');
const boardContainer = document.querySelector('.page-main .page-body__container');

const boardPresenter = new BoardPresenter({
  boardContainer,
  tripInfoContainer,
  filterContainer
});

boardPresenter.init();
