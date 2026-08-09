// Session state

const sessionSegment = {
    timestampBegan: null,
    timestampEnded: null,
    type: null
};

const sessionState = {
    sessionName: '',
    maxTimeHours: 0,
    numWorkSegments: 0,
    numRecoverySegments: 0,
    segments: [], // meant to be an array of session segments! 
    totalRecoveryTime: 0,
    totalWorkTime: 0
};

// It's not pretty, but we're just going to select various elements
// here because I really CBA to split everything up into files...

const taskName = document.querySelector('#task-name');
const taskLength = document.querySelector('#task-length');
const maximumTotalTime = document.querySelector('#maximum-total-time');
const setupPage = document.querySelector('#setup');
const workPage = document.querySelector('#work');
const playPage = document.querySelector('#play');
const setupForm = setupPage.querySelector('form');

function validateMaximumTotalTime() {
    const taskLengthInHours = Number(taskLength.value);
    const maximumTotalTimeInHours = Number(maximumTotalTime.value);
    const bothTimesEntered = taskLength.value !== '' && maximumTotalTime.value !== '';

    maximumTotalTime.setCustomValidity(
        bothTimesEntered && maximumTotalTimeInHours <= taskLengthInHours
            ? 'Maximum total time must be greater than the anticipated task length.'
            : ''
    );
}

taskLength.addEventListener('input', validateMaximumTotalTime);
maximumTotalTime.addEventListener('input', validateMaximumTotalTime);

// Page switching!

const pages = [setupPage, workPage, playPage];
function switch_to_page(pageName) {
    var nextPage;
    var loadPage;

    switch (pageName) {
        case 'setup':
            nextPage = setupPage;
            loadPage = setupPageLoaded;
            break;
        case 'work':
            nextPage = workPage;
            loadPage = workPageLoaded;
            break;
        case 'play':
            nextPage = playPage;
            loadPage = playPageLoaded;
            break;
        default:
            nextPage = setupPage;
            loadPage = setupPageLoaded;
    }

    pages.forEach((page) => {
        page.classList.toggle('d-none', page !== nextPage);
    });

    loadPage();
}

// Setup Page!

setupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    validateMaximumTotalTime();

    if (!setupForm.checkValidity()) {
        setupForm.reportValidity();
        return;
    }

    sessionState.sessionName = taskName.value;
    sessionState.maxTimeHours = Number(maximumTotalTime.value);

    switch_to_page('work');
});

switch_to_page('setup');

function setupPageLoaded() {
    setupForm.reset();
}

function workPageLoaded() {
}

function playPageLoaded() {
}
