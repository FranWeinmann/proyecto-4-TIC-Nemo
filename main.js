const leftOne = document.querySelector('.leftOne');
const rightOne = document.querySelector('.rightOne');

function checkOption (){
  let isOn = false;
  if(isOn){
    rightOne.classList.add('on');
    leftOne.classList.add('off');
  }
  else {
    rightOne.classList.remove('on');
    leftOne.classList.add('off');
  }
}

// Detecta la orientación de la pantalla
    function checkOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        const warning = document.querySelector('.warning-container');
        const container = document.querySelector('.container');
  
        if (isPortrait) {
          // Si está en orientación vertical, muestra el mensaje de advertencia
          warning.style.display = 'block';
          container.style.display = 'none';
        } else {
          // Si está en orientación horizontal, muestra el contenido
          warning.style.display = 'none';
          container.style.display = 'flex';
        }
      }
  
      // Ejecuta la comprobación cuando cambie la orientación
      window.addEventListener('resize', checkOrientation);
      
      // Ejecuta la comprobación al cargar la página
      checkOrientation();
      checkOption();