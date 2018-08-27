/* global SVG */

import assumptions from './assumptions.js';
import startApp from './react-app.js';

const xSize = 400;
const ySize = 400;
const xOffset = 20;
const yOffset = 25;
const lineWidth = 3;
const interval = {
  animation: 2000,
  transition: 1000,
  read: 1000,
  append: 75
};
const redLine = {
  width: lineWidth,
  color: 'red'
};
const axis = {
  width: lineWidth
};
const debug = false;

const pause = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const listAssumptions = () => {
  let list = assumptions;
  let i = 0;
  while (i < 2) {
    list = list.concat(list);
    i++;
  }
  return list;
};

const displayText = async(element, text) => {
  element.className = 'fade-out';
  await pause(interval.transition);
  element.innerHTML = text;
  element.className = 'fade-in';
  await pause(interval.transition);
  if (text !== '') await pause(interval.read);
};

const appendText = (parent, text) => {
  parent.appendChild(document.createElement('br'));
  parent.appendChild(document.createTextNode(text));
  parent.lastElementChild.scrollIntoView();
};

const drawLine = (svg) => {
  const y = ySize / 2;
  svg.line(xOffset - xSize, y, 0, y)
    .stroke(redLine)
    .animate(interval.animation)
    .move(xOffset, y);
};

const drawAxes = (svg) => {
  svg.line(xOffset - xSize, ySize - yOffset, 0, ySize - yOffset)
    .stroke(axis)
    .animate(interval.animation)
    .move(xOffset, ySize - yOffset);
  svg.line(xOffset, 2 * ySize, xOffset, ySize)
    .stroke(axis)
    .animate(interval.animation)
    .move(xOffset, -yOffset);
  svg.text('£');
  svg.text('now').move(2 * xOffset, ySize - 20);
  svg.text('future').move(15 * xOffset, ySize - 20);
};

const show = (element) => {
  element.className = '';
};

const hide = async(element) => {
  element.className = 'fade-out';
  await pause(interval.transition);
  element.display = 'none';
};

const resetForReact = () => {
  document.body.innerHTML = '';
  const container = document.createElement('div');
  container.id = 'react-container';
  document.body.appendChild(container);
};

const runIntroScript = async (elements) => {
  const text = displayText.bind(null, elements.text);
  drawLine(elements.svg);
  await text('This is a line.');
  await text('Not very interesting is it?');
  await text("Let's make it more interesting.");
  await text("Let's make it represent your wealth.");
  drawAxes(elements.svg);
  await pause(interval.read * 2);
  await text("It's pretty meaningless without numbers...");
  show(elements.form);
};

const runCalculationScript = async(elements) => {
  const text = displayText.bind(null, elements.text);
  await hide(elements.form);
  text("We're now going to make a lot of assumptions...");
  await displayText(elements.graphic, '');
  let delay = 0;
  listAssumptions().forEach((assumption) => {
    const callback = appendText.bind(null, elements.graphic, assumption);
    delay += interval.append;
    setTimeout(callback, delay);
  });
  await pause(delay / 3);
  await text('...and make a plan of your financial life.');
  await pause(interval.read);
  hide(elements.text);
  await hide(elements.graphic);
  resetForReact();
  startApp();
  return false;
};

const bypassIntro = async() => {
  resetForReact();
  startApp();
};

const elements = {
  form: document.getElementById('form'),
  graphic: document.getElementById('graphic'),
  svg: SVG('graphic').size(xSize, ySize),
  text: document.getElementById('text')
};
document.startCalculation = runCalculationScript.bind(null, elements);

if (debug) {
  Object.entries(interval).forEach(([key, value]) => {
    interval[key] = value / 10;
  });
}

runIntroScript(elements);
// bypassIntro();
