const leftOne = document.querySelector('.leftOne');
const rightOne = document.querySelector('.rightOne');
const rightSide = document.querySelector('.rightSide');
const onlyIfOn = document.querySelector('.onlyIfOn');
const humanBtn = document.querySelector('.humanBtn');
const robotBtn = document.querySelector('.robotBtn');
let isOn = true;
let camera = false;
let isHuman = true;
let joystickInstance = null;
let joystickCreated = false;

function changeSelectOption (option, diselected){
  option.classList.add('selected');
  diselected.classList.remove('selected');
  option.classList.remove('otherOption');
  diselected.classList.add('otherOption');
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
    removeJoystick();
  } else{
    changeSelectOption(robotBtn, humanBtn);
    createJoystick();
  }
}

function createJoystick (){
  if(!joystickCreated){
  joystickInstance = nipplejs.create({
    zone: document.getElementById('joystick-container'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    size: 180
  });

  joystickInstance.on('move', function (_, data) {
    if (data.angle) {
      const dir = Math.floor(data.angle.degree);
      const speed = Math.floor(data.distance);
      console.log(`Ángulo: ${dir}°, Velocidad: ${speed}`);
    }
  });

  joystickInstance.on('end', function () {
    console.log('Joystick liberado');
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
  }
}

window.addEventListener('resize', checkOrientation);
humanBtn.addEventListener('click', ()=>{ isHuman = true; changeMode(); });
robotBtn.addEventListener('click', ()=>{ isHuman = false; changeMode(); })
checkOrientation();
checkOption();
showCamera();
changeMode();