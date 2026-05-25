let questions = [];
let answers = [];
let currentQuestion = 0;
let selectedAnswer = null;
let timeLeft = 480;
let timerInterval = null;

const BASE_URL = "../Backend/";

document.addEventListener('DOMContentLoaded', function () {
    loadTestQuestions();
    startTimer();

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            selectAnswer(this.dataset.option, this);
        });
    });

    document.getElementById('submitBtn').addEventListener('click', submitAnswer);
});

function startTimer() {
    const timerEl  = document.getElementById('timeRemaining');
    const timerBox = document.getElementById('timerBox');

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerEl.textContent =
            (minutes < 10 ? '0' : '') + minutes + ':' +
            (seconds < 10 ? '0' : '') + seconds;

        if (timeLeft <= 60) timerBox.classList.add('warning');

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitTest();
        }

        timeLeft--;
    }, 1000);
}

async function loadTestQuestions() {
    try {
        const res = await fetch(BASE_URL + "Getquestions.php?limit=10", {
            credentials: 'include'
        });

        const data = await res.json();

        questions = data.questions || [];
        answers   = new Array(questions.length).fill(null);

        if (questions.length === 0) {
            document.getElementById('questionText').textContent = 'No questions available.';
            return;
        }

        displayQuestion();
    } catch (err) {
        console.error(err);
        document.getElementById('questionText').textContent = 'Failed to load questions.';
    }
}

function displayQuestion() {
    const q = questions[currentQuestion];

    document.getElementById('questionText').textContent = q.question_text;
    document.getElementById('optionA').textContent = q.option_a;
    document.getElementById('optionB').textContent = q.option_b;
    document.getElementById('optionC').textContent = q.option_c;
    document.getElementById('optionD').textContent = q.option_d;

    document.getElementById('currentQuestion').textContent = currentQuestion + 1;
    document.getElementById('totalQuestions').textContent  = questions.length;

    const pct = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = pct + '%';

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (answers[currentQuestion] === btn.dataset.option) {
            btn.classList.add('selected');
        }
    });

    selectedAnswer = answers[currentQuestion] || null;

    document.getElementById('submitBtn').textContent =
        currentQuestion === questions.length - 1 ? 'Submit Test ✓' : 'Next →';
}

function selectAnswer(option, btnEl) {
    selectedAnswer = option;
    answers[currentQuestion] = option;

    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    btnEl.classList.add('selected');
}

function submitAnswer() {
    if (!selectedAnswer) {
        alert('Please select an answer');
        return;
    }

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        selectedAnswer = null;
        displayQuestion();
    } else {
        submitTest();
    }
}

async function submitTest() {
    clearInterval(timerInterval);

    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
        const res = await fetch(BASE_URL + "Submittest.php", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers, questions }),
            credentials: 'include'
        });

        const result = await res.json();

        if (!result.success) {
            alert(result.message || "Submission failed");
            btn.textContent = 'Submit Test ✓';
            btn.disabled = false;
            return;
        }

        localStorage.setItem('result', JSON.stringify(result));
        window.location.href = 'result.html';

    } catch (err) {
        console.error(err);
        alert('Submission failed');
        btn.textContent = 'Submit Test ✓';
        btn.disabled = false;
    }
}