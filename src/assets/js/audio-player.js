const doc = window.document;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const symbolOfInputFileSelector = Symbol('inputFileSelector');
const symbolOfAudioElementSelector = Symbol('audioElementSelector');
const symbolOfReverbDurationInputSelector = Symbol('reverbDurationInputSelector');
const symbolOfBuildGrapch = Symbol('buildGraph');

function impulseResponse({duration = 0.2, decay = 2, reverse, contextInstance}) {
    const sampleRate = contextInstance.sampleRate;
    const length = sampleRate * duration;
    const impulse = contextInstance.createBuffer(2, length, sampleRate);
    let impulseL = impulse.getChannelData(0);
    let impulseR = impulse.getChannelData(1);

    if (!decay)
        decay = 2.0;
    for (var i = 0; i < length; i++) {
        var n = reverse ? length - i : i;
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
}

class BPlayer {
    constructor({inputFileSelector = '#fileChooserNearAudioTag', audioElementSelector = '#audioElementId', reverbDurationInputSelector = '#reverbDurationRangeInput'} = {}) {
        const self = this;

        this[symbolOfInputFileSelector] = inputFileSelector;
        this[symbolOfAudioElementSelector] = audioElementSelector;
        this[symbolOfReverbDurationInputSelector] = reverbDurationInputSelector;

        this[symbolOfBuildGrapch]({
            contextInstance: audioContext,
        });

        this.inputFileElement.addEventListener('change', function (e) {
            const fileObject = e.target.files[0];
            if (fileObject) {
                self.setSourceFile({fileObject});
            }
        });
    }

    get inputFileElement() {
        return doc.querySelector(this[symbolOfInputFileSelector]);
    }

    get audioElement() {
        return doc.querySelector(this[symbolOfAudioElementSelector]);
    }

    get reverbDurationInput() {
        return doc.querySelector(this[symbolOfReverbDurationInputSelector]);
    }

    setSourceFile({fileObject}) {
        const objectUrl = window.URL.createObjectURL(fileObject);
        this.audioElement.src = objectUrl;
    }

    [symbolOfBuildGrapch]({contextInstance}) {
        let impulseBuffer = impulseResponse({
            contextInstance,
            duration: parseFloat(this.reverbDurationInput.value)
        });

        const self = this;

        const audioSource = contextInstance.createMediaElementSource(this.audioElement);
        const convolver = contextInstance.createConvolver();
        const convolverGain = contextInstance.createGain();

        convolver.buffer = impulseBuffer;

        audioSource.connect(convolverGain);
        audioSource.connect(contextInstance.destination);
        convolverGain.connect(convolver);
        convolver.connect(contextInstance.destination);

        // contextInstance.decodeAudioData(impulseBuffer)
        //     .then(function (buffer) {
        //         convolver.buffer = buffer;
        //     });

        convolver.loop = true;
        convolver.normalize = true;
        convolverGain.gain.value = 0.5;

        this.reverbDurationInput.addEventListener('change', function(e){
            // update impulse buffer
            let newImpulseBuffer = impulseResponse({
                contextInstance,
                duration: parseFloat(self.reverbDurationInput.value)
            });
            convolver.buffer = newImpulseBuffer;
        });

        // this.audioElement.onload = function() {
        //     contextInstance.decodeAudioData( irRRequest.response,
        //         function(buffer) { convolver.buffer = buffer; } );
        // };

        // audioSource.connect(reverb);
        // reverb.connect(contextInstance.destination);
    }
}

export default BPlayer;