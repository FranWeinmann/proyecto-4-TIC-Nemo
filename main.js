const leftOne = document.querySelector('.leftOne');
const rightOne = document.querySelector('.rightOne');
const rightSide = document.querySelector('.rightSide');
const onlyIfOn = document.querySelector('.onlyIfOn');
let isOn = true;
let camera = false;

function checkOption (){
  if(isOn){
    rightOne.classList.add('on');
    leftOne.classList.remove('off');
    onlyIfOn.style.display = 'flex';

    const joystick = nipplejs.create({
      zone: document.getElementById('joystick-container'),
      mode: 'static',
      position: { left: '50%', top: '50%' },
      size: 180
    });
    
    joystick.on('move', function (_, data) {
      if (data.angle) {
        const dir = Math.floor(data.angle.degree);
        const speed = Math.floor(data.distance);
        console.log(`Ángulo: ${dir}°, Velocidad: ${speed}`);
      }
    });
    
    joystick.on('end', function () {
      console.log('Joystick liberado');
    });
  }
  else {
    rightOne.classList.remove('on');
    leftOne.classList.add('off');
    onlyIfOn.style.display = 'none';
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
checkOrientation();
checkOption();
showCamera();