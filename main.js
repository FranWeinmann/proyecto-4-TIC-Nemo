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
let isHuman = true;
let joystickInstance = null;
let joystickCreated = false;
const raspbiID = "10.8.5.160:5000";
let frenar = false;

function changeSelectOption (option, diselected){
  option.classList.remove('otherOption');
  diselected.classList.add('otherOption');
  if(window.innerWidth < 750){
    option.classList.add('selectedForCel');
    diselected.classList.remove('selectedForCel');
  } else{
    option.classList.add('selected');
    diselected.classList.remove('selected');
  }
  if(option === robotBtn){
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
    const joystickSize = window.innerWidth < 750 ? 97 : 185;
    const joystickMargin = window.innerWidth < 750 ? '25%' : '31%';
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
        frenar = false;
        fetch(`https://${raspbiID}/control`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direction, speed, frenar })
        }).catch(err => { console.error("Error al enviar:", err) });
      }
    });

    joystickInstance.on('end', function () {
      frenar = true;
      fetch(`https://${raspbiID}/control`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frenar })
        }).catch(err => { console.error("Error al enviar:", err) });
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

async function showCamera() {
  
  const videoUrl = `https://${raspbiID}/stream`;
  // let imagen = await fetch(videoUrl, { 
  //         method: "GET"
  //       }).catch(err => { console.error("Error al enviar:", err) });
  // console.log(imagen)
  const img = document.createElement("img");
  img.id = "video-stream";
  img.alt = "Video de detecciones";
  img.src = videoUrl;
  img.style = `
    width: 100%;
    height: 100%;
    border-radius: 20px;
    object-fit: cover;
    display: block;`;
  img.addEventListener("error", () => {
    rightSide.innerHTML = `<h1 style="font-size:4em; color:red;">⚠️ No se recibe el video</h1>`;
  });
  rightSide.innerHTML = "";
  rightSide.appendChild(img);
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
humanBtn.addEventListener('click', ()=>{
  isHuman = true;
  changeMode();
  fetch(`https://${raspbiID}/mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "manual" })
  }).catch(err => { console.error("Error al enviar:", err) });
});

robotBtn.addEventListener('click', ()=>{
  isHuman = false;
  changeMode();
  fetch(`https://${raspbiID}/mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "auto" })
  }).catch(err => { console.error("Error al enviar:", err) });
});
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
