const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const repeatButton = document.getElementById('repeat-btn');
const adjustButtons = document.querySelectorAll('.adjust-btn');
const conditionMinutesInput = document.getElementById('condition-minutes');
const conditionSecondsInput = document.getElementById('condition-seconds');
const addConditionBtn = document.getElementById('add-condition-btn');
const conditionsList = document.getElementById('conditions-list');
const volumeSlider = document.getElementById('volume-slider');
// 데이터 리셋 버튼
const resetDataButton = document.getElementById('reset-data-btn');
const customModal = document.getElementById('custom-modal');
const confirmButton = document.getElementById('confirm-btn');
const cancelButton = document.getElementById('cancel-btn');

let timerInterval;
const defaultTime = 180; // 기본 초기 타이머 시간 (3분 = 180초)
let initialTime = defaultTime; // 초기 타이머 시간
let timeRemaining = defaultTime; // 현재 타이머 남은 시간
let isRunning = false; // 타이머 상태 (true = 실행 중, false = 멈춤)
let isRepeating = true; // 반복 상태 초기값: 반복 중

// 조건 목록 초기화 및 로드
let conditions = JSON.parse(localStorage.getItem('conditions')) || [20]; // 기본값: 20초
if (!Array.isArray(conditions) || conditions.length === 0) {
    conditions = [20]; // 기본값으로 복원
    saveConditionsToLocalStorage(); // 로컬 스토리지에 저장
}


// 알림 소리 로드
let alertSound = new Audio('alert.mp3');
const endSound = new Audio('end.mp3'); // 타이머 종료 소리 파일 경로
const startSound = new Audio('start.mp3'); // 타이머 시작 소리 파일 경로
const stopSound = new Audio('stop.mp3'); // 타이머 멈춤 소리 파일 경로
const repeatSound = new Audio('repeat.mp3'); // 반복 버튼 클릭 시 재생될 소리
const clickSound = new Audio('click.mp3'); // 조정 버튼 클릭 시 재생될 소리

// 모든 소리 객체 배열
const allSounds = [alertSound, endSound, startSound, stopSound, repeatSound, clickSound];

// 볼륨 조절 이벤트
volumeSlider.addEventListener('input', (event) => {
    const volume = event.target.value; // 슬라이더 값 (0 ~ 1)
    allSounds.forEach((sound) => {
        sound.volume = volume; // 모든 소리의 볼륨 조절
    });

    // 사용자 지정 알림음에도 볼륨 적용
    if (alertSound) {
        alertSound.volume = volume;
    }
});

// 사용자 지정 알림음 변경 이벤트
const alertSoundInput = document.getElementById('alert-sound');
const fileNameDisplay = document.getElementById('file-name');
const playSoundButton = document.getElementById('play-sound-btn');

// 초기 알림음 파일 이름 설정
fileNameDisplay.textContent = 'alert.mp3'; // 초기 파일 이름 표시
playSoundButton.disabled = false; // 초기 재생 버튼 활성화

// 로컬 스토리지에서 파일 이름 및 URL 로드
const savedFileName = localStorage.getItem('alertSoundFileName');
const savedFileData = localStorage.getItem('alertSoundFileData');

if (savedFileName && savedFileData) {
    alertSound = new Audio(savedFileData); // Base64 데이터로 알림음 초기화
    fileNameDisplay.textContent = savedFileName; // 저장된 파일 이름 표시
    alertSound.volume = volumeSlider.value;
    playSoundButton.disabled = false;
} else {
    alertSound = new Audio('alert.mp3'); // 기본 알림음으로 설정
    fileNameDisplay.textContent = 'alert.mp3'; // 기본 파일 이름 표시
    playSoundButton.disabled = false;
}


// 사용자 지정 알림음 변경 이벤트
alertSoundInput.addEventListener('change', (event) => {
    clickSound.play(); // 알림음 변경 시 클릭 소리 재생
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const fileData = e.target.result; // Base64 데이터
            alertSound = new Audio(fileData); // 새 알림음을 Base64 데이터로 설정
            alertSound.volume = volumeSlider.value;

            fileNameDisplay.textContent = file.name; // 선택한 파일 이름 표시
            playSoundButton.disabled = false;

            // 로컬 스토리지에 파일 이름 및 Base64 데이터 저장
            localStorage.setItem('alertSoundFileName', file.name);
            localStorage.setItem('alertSoundFileData', fileData);
        };

        reader.readAsDataURL(file); // 파일 데이터를 Base64로 읽기
    } else {
        fileNameDisplay.textContent = "선택된 파일 없음"; // 파일 선택 취소 시
        playSoundButton.disabled = true;

        // 로컬 스토리지에서 파일 정보 제거
        localStorage.removeItem('alertSoundFileName');
        localStorage.removeItem('alertSoundFileData');
    }
});


// 소리 재생 버튼 클릭 이벤트
playSoundButton.addEventListener('click', () => {
    if (alertSound) {
        alertSound.play();
    }
});

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

// 로컬 스토리지에 조건 저장 함수
const saveConditionsToLocalStorage = () => {
    localStorage.setItem('conditions', JSON.stringify(conditions));
};

const addCondition = () => {
    const minutes = parseInt(conditionMinutesInput.value, 10) || 0;
    const seconds = parseInt(conditionSecondsInput.value, 10) || 0;

    const conditionInSeconds = minutes * 60 + seconds;

    // 유효성 검증
    if (conditionInSeconds > 0 && !conditions.includes(conditionInSeconds)) {
        conditions.push(conditionInSeconds);
        saveConditionsToLocalStorage();
        renderConditions();
    } else {
    }

    conditionMinutesInput.value = '';
    conditionSecondsInput.value = '';
};


// 조건 삭제 함수
const removeCondition = (index) => {
    conditions.splice(index, 1); // 해당 조건 제거
    saveConditionsToLocalStorage(); // 로컬 스토리지 업데이트
    renderConditions(); // 조건 목록 업데이트
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
            clickSound.play(); // 소리 재생
            removeCondition(index); // 조건 삭제
        });

        // 조건 항목에 삭제 버튼 추가
        li.appendChild(removeBtn);
        conditionsList.appendChild(li);
    });
};

// 페이지 로드 시 조건 목록 렌더링
window.addEventListener('DOMContentLoaded', () => {
    renderConditions(); // 조건 목록 UI 업데이트
});

// 페이지 로드 시 조건 목록 렌더링
renderConditions();

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

        // 소리 재생
        clickSound.play();

        // 시간 조정
        adjustTime(adjustment);
    });
});

// 조건 추가 버튼 클릭 이벤트
addConditionBtn.addEventListener('click', () => {
    clickSound.play(); // 소리 재생
    addCondition();
});

// 타이머 시작 버튼 클릭 이벤트
startButton.addEventListener('click', startTimer);

// 타이머 일시정지 버튼 클릭 이벤트
pauseButton.addEventListener('click', stopTimer);

// 리셋 버튼 클릭 이벤트
const resetButton = document.getElementById('reset-btn');
resetButton.addEventListener('click', () => {
    stopSound.play(); // 리셋 버튼 클릭 시 소리 재생
    resetTimer(); // 타이머 초기화
});

// 데이터 리셋 함수
const resetData = () => {
    // 로컬 스토리지 초기화
    localStorage.removeItem('alertSoundFileName');
    localStorage.removeItem('alertSoundFileURL');
    localStorage.removeItem('conditions');

    // 기본값 설정
    alertSound = new Audio('alert.mp3'); // 기본 알림음으로 복원
    conditions = [20]; // 기본 조건 복원

    // 강력 새로고침
    window.location.reload(true); // 페이지 새로고침
};

// 데이터 리셋 버튼 클릭 이벤트
resetDataButton.addEventListener('click', () => {
    customModal.style.display = 'block'; // 커스텀 모달 표시
});

// 모달 확인 버튼 클릭 이벤트
confirmButton.addEventListener('click', () => {
    customModal.style.display = 'none'; // 모달 숨기기
    resetData(); // 데이터 리셋 실행
});

// 모달 취소 버튼 클릭 이벤트
cancelButton.addEventListener('click', () => {
    customModal.style.display = 'none'; // 모달 숨기기
});

// 초기 상태 설정
resetTimer();
