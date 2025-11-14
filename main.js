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
        fetch(`http://${raspbiID}/control`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direction, speed, frenar })
        }).catch(err => { console.error("Error al enviar:", err) });
      }
    });

    joystickInstance.on('end', function () {
      fetch(`http://${raspbiID}/control`, { 
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

async function showCamera() {
  const videoUrl = `http://${raspbiID}/video`;
  const img = document.createElement("iframe");
  await fetch(videoUrl, { 
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "69420",
      "User-Agent": "custom-client", 
      "Content-Type": "application/json"
    }
  }) .then(res => {
    if (res.ok){
      img.src = videoUrl;
      console.log(res);
    }
    else console.log(res);
  }) .catch((err) => {
    rightSide.innerHTML = `<h1 style="font-size:4em; color:red;">⚠️ No se recibe el video</h1>`;
    console.log(err);
  });
  img.id = "video-stream";
  img.style = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;`;
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
  fetch(`http://${raspbiID}/mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "manual" })
  }).catch(err => { console.error("Error al enviar:", err) });
});

robotBtn.addEventListener('click', ()=>{
  isHuman = false;
  changeMode();
  fetch(`http://${raspbiID}/mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "auto" })
  }).catch(err => { console.error("Error al enviar:", err) });
});
leftOne.addEventListener('click', async ()=>{
  isOn = false;
  fetch(`http://${raspbiID}/isOn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isOn: isOn })
  }).catch(err => { console.error("Error al enviar:", err) });
  checkOption();
});
document.addEventListener('DOMContentLoaded', async () => {
  await fetch(`http://${raspbiID}/video`, {
    method: "HEAD",
    headers: new Headers({ "ngrok-skip-browser-warning": "69420" })
  })
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
