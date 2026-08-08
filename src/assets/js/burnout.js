const sessionState = {
    sessionName: '',
    recoveryRatio: 0,
    segments: [],
    totalRecoveryTime: 0,
    totalWorkTime: 0
};

const sessionSegment = {
    timestampBegan: null,
    timestampEnded: null,
    type: null
};

const depressedOMeter = document.querySelector('#depressed-o-meter');
const depressedOMeterValue = document.querySelector('#depressed-o-meter-value');
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
