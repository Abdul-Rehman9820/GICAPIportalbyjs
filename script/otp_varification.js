// Function to verify OTP
function verifyOTP(otp) {
  user = getUserInfo();
  mobile = user.mobile;
  customerId = user.customerId;
  showPreLoader();
  fetch(API_ENDPOINTS.VERIFY_OTP, {
    method: "POST",
    headers: postHeaders,
    body: JSON.stringify({ otp, mobile, customerId }),
  })
    .then((response) => response.json())
    .then((response) => {
      hidePreLoader();
      console.log(response);
      if (response.otp === "OTP Verified.") {
        sessionStorage.setItem("isOTPVerified", "true");
        location.href = location.origin + CONSTANTS.HOME_PAGE;
      } else {
        customAlert(MESSAGES.INVALID_OTP);
      }
    })
    .catch((err) => {
      hidePreLoader();
      console.error(err);
      customAlert(err);
    });
}

function onLoginBtnClick(event) {
  event.preventDefault();
  var otp = document.getElementById("otp_verify_otp").value;
  verifyOTP(otp);
}

function getUserInfo() {
  var userInfo = sessionStorage.getItem("userInfo");
  if (userInfo == null || userInfo == undefined || userInfo == {}) {
    location.href = location.origin + CONSTANTS.SIGN_IN_PAGE;
    return;
  }
  return JSON.parse(userInfo);
}

if (sessionStorage.getItem("isOTPVerified") === "true") {
  location.href = location.origin + "/index.html";
} else if (sessionStorage.getItem("isOTPSendSuccess") === "true") {
  user = getUserInfo();
  document.getElementById("otp_verify_customer_id").value = user.customerId;
  document.getElementById("otp_verify_mobile").value = user.mobile;
} else {
  location.href = location.origin + CONSTANTS.SIGN_IN_PAGE;
}

// Function to resend OTP
function ResendOTP(customerId, mobile) {
  showPreLoader();
  fetch(API_ENDPOINTS.SEND_OTP, {
    method: "POST",
    headers: postHeaders,
    body: JSON.stringify({ otp: 0, mobile, customerId }),
  })
    .then((response) => response.json())
    .then((response) => {
      hidePreLoader();
      if (response !== undefined && response.Message === "OTP Sent.") {
        customAlert(MESSAGES.OTP_SENT_SUCCESSFUL);
        resetTimer();
      } else {
        customAlert(MESSAGES.API_FAILED_MESSAGE);
      }
    })
    .catch((err) => {
      hidePreLoader();
      console.error(err);
      customAlert(MESSAGES.API_FAILED_MESSAGE);
    });
}

function reSendOTPBtnClicked() {
  var customerId = document.getElementById("otp_verify_customer_id").value;
  var mobile = document.getElementById("otp_verify_mobile").value;
  ResendOTP(customerId, mobile);
}

var timerElement = document.getElementById("time");
var timerId;

function startTimer(duration) {
  if (timerId) {
    clearInterval(timerId);
  }
  const savedIntervalId = sessionStorage.getItem("intervalId");
  if (savedIntervalId) {
    clearInterval(savedIntervalId);
    sessionStorage.removeItem("intervalId");
  }
  const startTime = sessionStorage.getItem("startTime");

  if (startTime) {
    const elapsedTime = Date.now() - parseInt(startTime);
    const remainingTime = duration - elapsedTime;
    updateTimer(remainingTime);

    timerId = setInterval(() => {
      if (isReSendBtnEnabled()) {
        document.getElementById("otp_varify_resend_btn").disabled = false;
      } else {
        document.getElementById("otp_varify_resend_btn").disabled = true;
      }
      const elapsedTime = Date.now() - parseInt(startTime);
      const remainingTime = duration - elapsedTime - 1000;
      if (remainingTime <= 0) {
        clearInterval(timerId);
        clearSession();
        location.href = location.origin + CONSTANTS.SIGN_IN_PAGE;
      } else {
        updateTimer(remainingTime);
      }
    }, 1000);
    sessionStorage.setItem("intervalId", timerId);
  } else {
    clearSession();
    location.href = location.origin + CONSTANTS.SIGN_IN_PAGE;
  }
}

function updateTimer(remainingTime) {
  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);
  timerElement.textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function isReSendBtnEnabled() {
  const startTime = sessionStorage.getItem("startTime");
  const elapsedTime = Date.now() - parseInt(startTime);
  const remainingTime = CONSTANTS.OTP_TIMEOUT - elapsedTime;
  return remainingTime < CONSTANTS.OTP_TIMEOUT - CONSTANTS.RESEND_OTP_TIMEOUT;
}

function resetTimer() {
  sessionStorage.setItem("startTime", Date.now());
  startTimer(CONSTANTS.OTP_TIMEOUT);
}

window.addEventListener("unload", () => {
  sessionStorage.setItem("intervalId", timerId);
});

window.onload = function () {
  startTimer(CONSTANTS.OTP_TIMEOUT);
};
