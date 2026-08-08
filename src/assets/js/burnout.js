// Session state

const sessionSegment = {
    timestampBegan: null,
    timestampEnded: null,
    type: null
};

const sessionState = {
    sessionName: '',
    recoveryRatio: 0,
    segments: [], // meant to be an array of session segments! 
    totalRecoveryTime: 0,
    totalWorkTime: 0
};


// It's not pretty, but we're just going to select various elements
// here because I really CBA to split everything up into files...

const depressedOMeter = document.querySelector('#depressed-o-meter');
const depressedOMeterValue = document.querySelector('#depressed-o-meter-value');

// Depresssed-O-Meter UI functionality! 

const depressedOMeterOptions = [
    'Stuck in Bed...',
    'Seen Better Days...',
    'Decent.',
    'Peachy!',
    'Best Day Ever!'
];

function updateDepressedOMeter() {
    const selectedOption = depressedOMeterOptions[Number(depressedOMeter.value)];

    depressedOMeterValue.textContent = selectedOption;
    depressedOMeter.setAttribute('aria-valuetext', selectedOption);
}

depressedOMeter.addEventListener('input', updateDepressedOMeter);
updateDepressedOMeter();
