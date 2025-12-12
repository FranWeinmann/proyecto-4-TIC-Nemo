const leftOne = document.querySelector('.leftOne');
const rightOne = document.querySelector('.rightOne');
const rightSide = document.querySelector('.rightSide');
const onlyIfOn = document.querySelector('.onlyIfOn');
const humanBtn = document.querySelector('.humanBtn');
const robotBtn = document.querySelector('.robotBtn');
const joystick  = document.getElementById('joystick-container');
const btnBox = document.querySelector('.btnBox');
const box = document.querySelector('.box');
let isOn = false;
let isHuman = true;
let joystickInstance = null;
let joystickCreated = false;
const raspbiID = "lucy-postventral-captiously.ngrok-free.dev";
let frenar = false;
let lastSent = 0;

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

function mapRange(value, inMin, inMax, outMin, outMax) {
  return Math.min(outMax, Math.max(outMin,
    (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
  ));
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
        const now = Date.now();
        if (now - lastSent < 100) return;
        lastSent = now;
    
        const direction = Math.floor(data.angle.degree);
        const rawSpeed = data.distance;
        const speed = Math.floor(mapRange(rawSpeed, 0, 150, 0, 100));
    
        frenar = false;
        fetch(`https://${raspbiID}/control`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direction, speed, frenar })
        }).catch(err => { console.error("Error al enviar:", err) });
      }
    });

    joystickInstance.on('end', function () {
      fetch(`https://${raspbiID}/control`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frenar: true, speed: 0 })
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
    rightSide.innerHTML = "";
    rightSide.innerHTML = `<h1 style="font-size:4em; color:black;">Raspby apagada</h1>`;
  }
}

async function checkRaspberry() {
  try {
    const response = await fetch(`https://${raspbiID}/verify`, {
      method: "GET",
      headers: { "ngrok-skip-browser-warning": "true" }
    });

    if (!response.ok) throw new Error("No responde");
    isOn = true;
    checkOption();
    showCamera();
    console.log(response);
  } catch (err) {
    isOn = false;
    checkOption();
    console.log(response);
    console.log(err);
  }
}

function showCamera() {
  const videoUrl = `https://${raspbiID}/video`;
  const img = document.createElement("iframe");
  img.id = "video-stream";
  img.style = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;`;
  img.src = videoUrl;
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
leftOne.addEventListener('click', async ()=>{
  isOn = false;
  fetch(`https://${raspbiID}/isOn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isOn: isOn })
  }).catch(err => { console.error("Error al enviar:", err) });
  checkOption();
});
document.addEventListener('DOMContentLoaded', async () => {
  await checkRaspberry();
  adjustDimensions();
  checkOrientation();
  checkOption();
  showCamera();
  changeMode();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registrado:', reg))
    .catch(err => console.log('Error registrando SW:', err));
}
