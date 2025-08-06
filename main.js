const leftOne = document.querySelector('.leftOne');
const rightOne = document.querySelector('.rightOne');
const rightSide = document.querySelector('.rightSide');
let isOn = false;
let camera = false;

function checkOption (){
  if(isOn){
    rightOne.classList.add('on');
    leftOne.classList.remove('off');
  }
  else {
    rightOne.classList.remove('on');
    leftOne.classList.add('off');
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