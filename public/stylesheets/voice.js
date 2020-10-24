//Voice recognition
const btn = document.querySelector('.talk');
const content = document.querySelector('.inputContent');


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onstart = () => {
    console.log('voice activated');
}

recognition.onresult = (event) => {
    const currentText = event.resultIndex;
    const transcript = event.results[currentText][0].transcript;
    console.log(transcript);
    content.value = transcript;
}

btn.addEventListener('click', () => {
    recognition.start();
});

