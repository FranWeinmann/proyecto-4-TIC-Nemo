const leftOne = document.querySelector('.leftOne');
const rightOne = document.querySelector('.rightOne');
const rightSide = document.querySelector('.rightSide');
const onlyIfOn = document.querySelector('.onlyIfOn');
const humanBtn = document.querySelector('.humanBtn');
const robotBtn = document.querySelector('.robotBtn');
const joystick  = document.getElementById('joystick-container');
const btnBox = document.querySelector('.btnBox');
const box = document.querySelector('.box');
let isOn = true;
let camera = false;
let isHuman = true;
let joystickInstance = null;
let joystickCreated = false;

function changeSelectOption (option, diselected){
  option.classList.remove('otherOption');
  diselected.classList.add('otherOption');
  if(window.innerWidth < 600){
    option.classList.add('selectedForCel');
    diselected.classList.remove('selectedForCel');
  } else{
    option.classList.add('selected');
    diselected.classList.remove('selected');
  }
  if(option = robotBtn){
    removeJoystick();
  }
}

function removeJoystick() {
  if (joystickInstance) {
    joystickInstance.destroy();
    joystickInstance = null;
    joystickCreated = false;
  }
}

function changeMode (){
  if(!isHuman){
    changeSelectOption(humanBtn, robotBtn);
    if(isOn){
      removeJoystick();
    }
  } else{
    changeSelectOption(robotBtn, humanBtn);
    if(isOn){
      createJoystick();
    }
  }
}

function createJoystick (){
  if(!joystickCreated){
    const joystickSize = window.innerWidth < 600 ? 97 : 185;
    const joystickMargin = window.innerWidth < 600 ? '25%' : '31%';
    joystick.style.marginTop = joystickMargin;
    joystickInstance = nipplejs.create({
      zone: joystick,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      size: joystickSize
    });

    joystickInstance.on('move', function (_, data) {
      if (data) {
        const direction = Math.floor(data.angle.degree);
        const speed = Math.floor(data.distance);
        // Cambiar para mandarselo al hard: console.log(`Ángulo: ${direction}°, Velocidad: ${speed}`);
      }
    });

    joystickInstance.on('end', function () {
      // console.log('Joystick liberado');
    });
    joystickCreated = true;
  }
}

function checkOption (){
  if(isOn){
    rightOne.classList.add('on');
    leftOne.classList.remove('off');
    onlyIfOn.style.display = 'flex';
    createJoystick();
  } else {
    rightOne.classList.remove('on');
    leftOne.classList.add('off');
    onlyIfOn.style.display = 'none';
    removeJoystick();
  }
}

function showCamera (){
  if(!camera){
    const newText = document.createElement('h1');
    newText.style = `
    font-size: 4em;
    color: red;`;
    newText.textContent = '⚠️ No se recibe el video';
    rightSide.appendChild(newText);
  }
}

function adjustDimensions (){
  if (window.innerWidth < 600){
    box.style.height = '83%';
    box.style.marginTop = '-2.5%'
    humanBtn.style.height = '80%';
    robotBtn.style.height = '80%';
    humanBtn.style.width = '30%';
    robotBtn.style.width = '30%';
  }
}

function checkOrientation() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const warning = document.querySelector('.warning-container');
  const container = document.querySelector('.container');
  if (isPortrait) {
    warning.style.display = 'block';
    container.style.display = 'none';
  } else {
    warning.style.display = 'none';
    container.style.display = 'flex';
    adjustDimensions();
  }
}

window.addEventListener('resize', checkOrientation);
humanBtn.addEventListener('click', ()=>{ isHuman = true; changeMode(); });
robotBtn.addEventListener('click', ()=>{ isHuman = false; changeMode(); })
document.addEventListener('DOMContentLoaded', adjustDimensions);
checkOrientation();
checkOption();
showCamera();
changeMode();
adjustDimensions();


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registrado:', reg))
    .catch(err => console.log('Error registrando SW:', err));
}