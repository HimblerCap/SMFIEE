// Definiendo las constantes 
const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const camaraSection = document.getElementById('camaraSection');
const enableWebcamButton = document.getElementById('playButtom');


//Verificar si es que el usuario tiene acceso a una camara
function hasGetUserMedia() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

//Si el usuario tiene Webcam, agregamos el evento "Listener" para
//que cuando el usuario desee activar su camara se active con la 
//siguiente funcion 
if (hasGetUserMedia()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}

//Activacion de la camara para realizar la clasificacion
function enableCam(event) {

  //condicional para que solo se ejecute esta funcion si el modelo
  //esta cargado
  if (!model) {
    console.log('¡Espera! el modelo aun no ha sido cargado ')
    return; 
  }
  
  //Ocultar el boton una vez que ha sido seleccionado
  event.target.classList.add('removed');  
  
  //Parametros de getUserMedia para forzar el video y no el audio
  const constraints = {
    video: true
  };

  //Activar tu camara
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}

//Creacion de una variable global que almacene el modelo
var model = undefined;

//Antes de poder usar coco-ssd, debemos esperar a que termine de cargar
//Generalmente los modelos de Machine Learning suelen ser grandes y 
//Toman un tiempo para empezar a cargar
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  camaraSection.classList.remove('invisible');
});


var children = [];

//Funcion para realizar las predicciones
function predictWebcam() {

  //Ahora comenzamos a realizar las predicciones de los cuadrados formados
  model.detect(video).then(function (predictions) {

    //Eliminar cualquier resaltado que se realizo en el cuadro generado anteriormente
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    // Ahora repasemos las predicciones y dibujemoslas en la vista en vivo si tienen 
    //una puntuacion de confianza alta.
    for (let n = 0; n < predictions.length; n++) {

      //Si existe un porcentaje de precision del 70% clasificaremos la red neuronal 
      if (predictions[n].score > 0.70) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - con ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% de eficiencia.';
        p.style = 'left: ' + predictions[n].bbox[0] + 'px;' +
            'top: ' + predictions[n].bbox[1] + 'px;' + 
            'width: ' + (predictions[n].bbox[2]) + 'px;';


        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);

        children.push(highlighter);
        children.push(p);
      }
    }

    //Vuelva a llamar a esta funcion para seguir prediciendo cuando 
    //estara listo el navegador.
    window.requestAnimationFrame(predictWebcam);
  });
}
