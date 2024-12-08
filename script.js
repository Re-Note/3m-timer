const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const repeatButton = document.getElementById('repeat-btn');
const adjustButtons = document.querySelectorAll('.adjust-btn');
const conditionMinutesInput = document.getElementById('condition-minutes');
const conditionSecondsInput = document.getElementById('condition-seconds');
const addConditionBtn = document.getElementById('add-condition-btn');
const conditionsList = document.getElementById('conditions-list');

let timerInterval;
const defaultTime = 180; // 기본 초기 타이머 시간 (3분 = 180초)
let initialTime = defaultTime; // 초기 타이머 시간
let timeRemaining = defaultTime; // 현재 타이머 남은 시간
let isRunning = false; // 타이머 상태 (true = 실행 중, false = 멈춤)
let isRepeating = true; // 반복 상태 초기값: 반복 중
let conditions = [20]; // 사용자 정의 조건 (기본값: 20초)

// 알림 소리 로드
const alertSound = new Audio('alert.mp3'); // 알림 소리 파일 경로
const endSound = new Audio('end.mp3'); // 타이머 종료 소리 파일 경로
const startSound = new Audio('start.mp3'); // 타이머 시작 소리 파일 경로
const stopSound = new Audio('stop.mp3'); // 타이머 멈춤 소리 파일 경로
const repeatSound = new Audio('repeat.mp3'); // 반복 버튼 클릭 시 재생될 소리

// 타이머 시작 함수
const startTimer = () => {
    if (isRunning) return; // 타이머가 이미 실행 중이면 아무것도 하지 않음

    isRunning = true;
    startSound.play(); // 타이머 시작 소리 재생

    timerInterval = setInterval(() => {
        timeRemaining--;

        // 사용자 정의 조건 확인
        if (conditions.includes(timeRemaining)) {
            alertSound.play(); // 조건 만족 시 소리 재생
        }

        if (timeRemaining === 0) {
            endSound.play(); // 종료 소리 재생
            if (isRepeating) {
                timeRemaining = initialTime; // 반복 상태면 초기 시간으로 재설정
                updateDisplay(timeRemaining); // 화면 업데이트
            } else {
                stopTimer(); // 반복 상태가 아니면 멈춤
                timeRemaining = initialTime; // 초기 시간으로 복원
                updateDisplay(timeRemaining);
            }
        }

        updateDisplay(timeRemaining);
    }, 1000); // 1초마다 업데이트
};

// 타이머 정지 함수
const stopTimer = () => {
    clearInterval(timerInterval);
    isRunning = false;
    stopSound.play(); // 타이머 멈춤 소리 재생
};

// 타이머 화면을 업데이트하는 함수
const updateDisplay = (seconds) => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${secs}`;
};

// 타이머 초기화 함수
const resetTimer = () => {
    stopTimer(); // 타이머 정지
    timeRemaining = initialTime; // 남은 시간을 초기값으로 설정
    renderConditions(); // 조건 목록 업데이트
    updateDisplay(timeRemaining); // 화면 업데이트
};

// 타이머 시간 조정 함수
const adjustTime = (adjustment) => {
    initialTime += adjustment; // 초기 타이머 시간 조정
    timeRemaining = initialTime; // 현재 남은 시간도 동일하게 변경

    // 타이머 시간은 최소 0초로 설정
    if (initialTime < 0) {
        initialTime = 0;
        timeRemaining = 0;
    }

    updateDisplay(timeRemaining);
};

// 조건 추가 함수
const addCondition = () => {
    const minutes = parseInt(conditionMinutesInput.value, 10) || 0;
    const seconds = parseInt(conditionSecondsInput.value, 10) || 0;

    // 분과 초를 합산하여 초 단위로 변환
    const conditionInSeconds = minutes * 60 + seconds;

    if (conditionInSeconds > 0 && !conditions.includes(conditionInSeconds)) {
        conditions.push(conditionInSeconds);
        renderConditions();
    }

    // 입력 필드 초기화
    conditionMinutesInput.value = '';
    conditionSecondsInput.value = '';
};

// 조건 목록 렌더링 함수
const renderConditions = () => {
    conditionsList.innerHTML = ''; // 기존 조건 목록 초기화

    conditions.forEach((condition, index) => {
        const minutes = Math.floor(condition / 60);
        const seconds = condition % 60;

        // 조건 항목 생성
        const li = document.createElement('li');
        li.textContent = `${minutes}분 ${seconds}초`;

        // 삭제 버튼 생성
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.style.background = 'none';
        removeBtn.style.border = 'none';
        removeBtn.style.color = '#ff4d4d';
        removeBtn.style.fontSize = '1.2rem';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.marginLeft = '10px';

        // 삭제 버튼 클릭 이벤트 추가
        removeBtn.addEventListener('click', () => {
            conditions.splice(index, 1); // 해당 조건 제거
            renderConditions(); // 목록 업데이트
        });

        // 조건 항목에 삭제 버튼 추가
        li.appendChild(removeBtn);
        conditionsList.appendChild(li);
    });
};

// 반복 버튼 초기 상태 설정
repeatButton.textContent = '반복 중'; // 초기 텍스트 설정
repeatButton.classList.remove('not-repeating'); // 빨간색 상태 유지

// 반복 버튼 클릭 이벤트
repeatButton.addEventListener('click', () => {
    isRepeating = !isRepeating; // 반복 상태 토글

    // 반복 버튼 클릭 시 소리 재생
    repeatSound.play();

    // 상태에 따라 버튼 스타일 및 텍스트 변경
    if (isRepeating) {
        repeatButton.textContent = '반복 중';
        repeatButton.classList.remove('not-repeating'); // 빨간색 상태로 변경
    } else {
        repeatButton.textContent = '반복';
        repeatButton.classList.add('not-repeating'); // 파란색 상태로 변경
    }
});

// 각 조정 버튼에 클릭 이벤트 추가
adjustButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const adjustment = parseInt(button.getAttribute('data-adjust'), 10);
        adjustTime(adjustment);
    });
});

// 조건 추가 버튼 클릭 이벤트
addConditionBtn.addEventListener('click', addCondition);

// 타이머 시작 버튼 클릭 이벤트
startButton.addEventListener('click', startTimer);

// 타이머 일시정지 버튼 클릭 이벤트
pauseButton.addEventListener('click', stopTimer);

// 초기 상태 설정
resetTimer();
