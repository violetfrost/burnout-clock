// Session state

const sessionSegment = {
    timestampBegan: null,
    timestampEnded: null,
    type: null
};

const sessionState = {
    sessionName: '',
    maxTimeHours: 0,
    numSegments: 0,
    workSegmentLengthMinutes: 0,
    playSegmentLengthMinutes: 0,
    segments: [], // meant to be an array of session segments! 
    totalRecoveryTime: 0,
    totalWorkTime: 0
};

// It's not pretty, but we're just going to select various elements
// here because I really CBA to split everything up into files...

const taskName = document.querySelector('#task-name');
const taskLength = document.querySelector('#task-length');
const maximumTotalTime = document.querySelector('#maximum-total-time');
const returnToWorkTime = document.querySelector('#return-to-work-time');
const completedWorkMinutes = document.querySelector('#completed-work-minutes');
const setupPage = document.querySelector('#setup');
const workPage = document.querySelector('#work');
const playPage = document.querySelector('#play');
const finishPage = document.querySelector('#finish');
const setupForm = setupPage.querySelector('form');
const endWorkSegmentButton = document.querySelector('#end-work-segment');
const endPlaySegmentButton = document.querySelector('#end-play-segment');
const downloadSessionRecordsButton = document.querySelector('#download-session-records');
const startNewTaskButton = document.querySelector('#start-new-task');
const pageChime = new Audio('assets/sound/chime.wav');
let activeSegmentTimeout = null;

function validateMaximumTotalTime() {
    maximumTotalTime.setCustomValidity(
        taskLength.value !== ''
            && maximumTotalTime.value !== ''
            && Number(maximumTotalTime.value) <= Number(taskLength.value)
            ? 'Maximum total time must be greater than the anticipated task length.'
            : ''
    );
}

taskLength.addEventListener('input', validateMaximumTotalTime);
maximumTotalTime.addEventListener('input', validateMaximumTotalTime);

function calculateSessionSegments(workTimeHours, maxTimeHours) {
    const workTimeMinutes = workTimeHours * 60;
    const playTimeMinutes = Math.min(workTimeMinutes, (maxTimeHours * 60) - workTimeMinutes);
    const numWorkSegments = playTimeMinutes === workTimeMinutes
        ? 3
        : Math.max(2, Math.round(workTimeMinutes / (workTimeMinutes - playTimeMinutes)));
    const numPlaySegments = numWorkSegments - 1;

    sessionState.numSegments = numWorkSegments + numPlaySegments;
    sessionState.workSegmentLengthMinutes = workTimeMinutes / numWorkSegments;
    sessionState.playSegmentLengthMinutes = playTimeMinutes / numPlaySegments;
}

function startSessionSegment(type, lengthMinutes) {
    clearTimeout(activeSegmentTimeout);

    const previousSegment = sessionState.segments.at(-1);
    if (previousSegment && previousSegment.timestampEnded === null) {
        previousSegment.timestampEnded = Date.now();
    }

    const segment = {
        ...sessionSegment,
        timestampBegan: Date.now(),
        type: type
    };

    sessionState.segments.push(segment);
    activeSegmentTimeout = setTimeout(
        () => endSessionSegment(type),
        lengthMinutes * 60 * 1000
    );

    return segment;
}

function endSessionSegment(type) {
    const segment = sessionState.segments.at(-1);

    if (!segment || segment.type !== type || segment.timestampEnded !== null) {
        return;
    }

    clearTimeout(activeSegmentTimeout);
    activeSegmentTimeout = null;
    segment.timestampEnded = Date.now();

    if (type === 'work') {
        sessionState.totalWorkTime += (segment.timestampEnded - segment.timestampBegan) / 60000;
    } else {
        sessionState.totalRecoveryTime += (segment.timestampEnded - segment.timestampBegan) / 60000;
    }

    if (sessionState.segments.length < sessionState.numSegments) {
        switch_to_page(type === 'work' ? 'play' : 'work');
    } else {
        switch_to_page('finish');
    }
}

endWorkSegmentButton.addEventListener('click', () => endSessionSegment('work'));
endPlaySegmentButton.addEventListener('click', () => endSessionSegment('play'));

// Page switching!

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
        case 'finish':
            nextPage = finishPage;
            loadPage = finishPageLoaded;
            break;
        default:
            nextPage = setupPage;
            loadPage = setupPageLoaded;
    }

    const pageChanged = nextPage.classList.contains('d-none');

    [setupPage, workPage, playPage, finishPage].forEach((page) => {
        page.classList.toggle('d-none', page !== nextPage);
    });

    if (pageChanged) {
        pageChime.currentTime = 0;
        pageChime.play().catch(() => {});
    }

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
    sessionState.segments = [];
    sessionState.totalRecoveryTime = 0;
    sessionState.totalWorkTime = 0;
    calculateSessionSegments(Number(taskLength.value), sessionState.maxTimeHours);

    switch_to_page('work');
});

switch_to_page('setup');

function setupPageLoaded() {
    setupForm.reset();
}

function workPageLoaded() {
    startSessionSegment('work', sessionState.workSegmentLengthMinutes);
}

function playPageLoaded() {
    const segment = startSessionSegment('play', sessionState.playSegmentLengthMinutes);
    const returnTime = new Date(
        segment.timestampBegan + (sessionState.playSegmentLengthMinutes * 60 * 1000)
    );

    returnToWorkTime.dateTime = returnTime.toISOString();
    returnToWorkTime.textContent = returnTime.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
    });
}

function finishPageLoaded() {
    completedWorkMinutes.textContent = Math.round(sessionState.totalWorkTime);
}

downloadSessionRecordsButton.addEventListener('click', () => {
    const taskNameSlug = sessionState.sessionName
        .trim()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'unnamed-task';
    const downloadTimestamp = new Date()
        .toISOString()
        .replace('T', '_')
        .replace(/\.\d{3}Z$/, 'z')
        .replace(/:/g, '-');
    const recordsUrl = URL.createObjectURL(new Blob(
        [JSON.stringify(sessionState, null, 2)],
        { type: 'application/json' }
    ));
    const downloadLink = document.createElement('a');

    downloadLink.href = recordsUrl;
    downloadLink.download = `burnout-clock-session-${taskNameSlug}-${downloadTimestamp}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(recordsUrl);
});

startNewTaskButton.addEventListener('click', () => switch_to_page('setup'));
