const video = document.getElementById("video");
const play = document.getElementById("play");
const stop = document.getElementById("stop");
const liveView = document.getElementById("liveView")

play.addEventListener("click", () => {
    video.play();
});

stop.addEventListener("click", () => {
    video.pause();
    video.currentTime = 0;  
});

//Creacion de una variable global que almacene el modelo
var model = undefined;

//Antes de poder usar coco-ssd, debemos esperar a que termine de cargar
//Generalmente los modelos de Machine Learning suelen ser grandes y 
//Toman un tiempo para empezar a cargar
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
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
          p.style = 'left: ' + (predictions[n].bbox[0] + 20) + 'px;' +
              'top: ' + (predictions[n].bbox[1]) + 'px;' + 
              'width: ' + (predictions[n].bbox[2] - 20) + 'px;';
  
  
          const highlighter = document.createElement('div');
          highlighter.setAttribute('class', 'highlighter');
          highlighter.style = 'left: ' + (predictions[n].bbox[0] + 20)  + 'px; top: '
              + (predictions[n].bbox[1]) + 'px; width: ' 
              + (predictions[n].bbox[2] - 20)+ 'px; height: '
              + (predictions[n].bbox[3]) + 'px;';
  
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
  
// Captura fotograma video

(function() {

    let streaming    = false,
        video        = document.querySelector('#video'),
        canvas       = document.querySelector('#canvas'),
        photo        = document.querySelector('#photo'),
        startbutton  = document.querySelector('#startbutton'),
        width        = 640,
        height       = 480;
    
    navigator.getMedia = ( navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia);

    navigator.getMedia(
    {
        video: true,
    },

    function(stream) {
        if (navigator.mozGetUserMedia) {
            video.mozSrcObject = stream;
            video.addEventListener('loadeddata', predictWebcam);
        } else {
            video.srcObject = stream;
            video.addEventListener('loadeddata', predictWebcam);
        }
        video.play();
    },

    function(err) {
        console.log("An error occured! " + err);
    }
    );

    video.addEventListener('canplay', function(ev){
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth/width);
            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);

    function takepicture() {

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(video, 0, 0, width, height);

        let data = canvas.toDataURL('image/png');


        photo.setAttribute('src', data);
    }

    const agregar = document.querySelector("#plus");

    startbutton.addEventListener('click', function(ev){
        takepicture();

        agregar.disabled = false;

        ev.preventDefault();
    }, false);

    const w3_content = document.querySelector("#w3-content");

    let cont = 1;

    agregar.addEventListener("click", (event) => {


        let data_url = canvas.toDataURL('image/png');


        console.log(data_url);

        w3_content.insertAdjacentHTML('afterbegin', `
        <div class="w3-display-container mySlides">
            <img class="image_cut" src="${data_url}" style="width:100%">
            <div class="w3-display-topleft w3-large w3-container w3-padding-16 w3-black">
              ${cont++}
            </div>
        </div>
        `);

        agregar.disabled = true;

        event.preventDefault();

    });

    // Download

    const download_all = document.querySelector("#download");

    download_all.addEventListener("click", () => {
        
        const all_url_images = document.querySelectorAll(".image_cut");


        let cont_image = 1;

        all_url_images.forEach(image => {

            axios({
                url:`${image.src}`,
                method:'GET',
                responseType: 'blob'
            })
            .then((response) => {
                const url = window.URL
                .createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `image${cont_image}.jpg`);
                        document.body.appendChild(link);
                        link.click();
            
                cont_image++;
            })
        });

        
    });
})();

