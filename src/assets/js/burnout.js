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
const setupPage = document.querySelector('#setup');
const workPage = document.querySelector('#work');
const playPage = document.querySelector('#play');
const setupForm = setupPage.querySelector('form');

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

// Page switching!

const pages = [setupPage, workPage, playPage];
function switch_to_page(pageName) {
    var nextPage;

    switch (pageName) {
        case 'setup':
            nextPage = setupPage;
            break;
        case 'work':
            nextPage = workPage;
            break;
        case 'play':
            nextPage = playPage;
            break;
        default:
            nextPage = setupPage;
    }

    pages.forEach((page) => {
        page.classList.toggle('d-none', page !== nextPage);
    });
}

// Setup Page!

setupForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!setupForm.checkValidity()) {
        setupForm.reportValidity();
        return;
    }

    switch_to_page('work');
});