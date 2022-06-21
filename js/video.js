const video = document.querySelector("#video");
const play = document.querySelector("#play");
const stop = document.querySelector("#stop");

play.addEventListener("click", () => {
    video.play();
});

stop.addEventListener("click", () => {
    video.pause();
    video.currentTime = 0;  
});

// Captura fotograma video

(function() {

    let streaming    = false,
        video        = document.querySelector('#video'),
        canvas       = document.querySelector('#canvas'),
        photo        = document.querySelector('#photo'),
        startbutton  = document.querySelector('#startbutton'),
        width        = 500,
        height       = 0;
    
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
        } else {
            video.srcObject = stream;
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

