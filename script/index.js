// Function to get PDF
function getSOA() {
  var fileNumber = getFileNumber();
  if (fileNumber == null || fileNumber == undefined) {
    customAlert(MESSAGES.INVALID_FILE_NUMBER);
  } else {
    getPDF(API_ENDPOINTS.GET_SOA, CONSTANTS.STATEMENT_OF_ACCOUNT);
  }
}

function getProvisionalCert() {
  var fileNumber = getFileNumber();
  if (fileNumber == null || fileNumber == undefined) {
    customAlert(MESSAGES.INVALID_FILE_NUMBER);
  } else {
    getPDF(
      API_ENDPOINTS.GET_PROVISIONAL_CERTIFICATE,
      CONSTANTS.PROVISIONAL_CERTIFICATE
    );
  }
}

function getITCert() {
  var fileNumber = getFileNumber();
  if (fileNumber == null || fileNumber == undefined) {
    customAlert(MESSAGES.INVALID_FILE_NUMBER);
  } else {
    getPDF(API_ENDPOINTS.GET_IT_CERTIFICATE, CONSTANTS.IT_CERTIFICATE);
  }
}

function getPDF(apiEndPoint, fileName) {
  showPreLoader();
  fetch(apiEndPoint + getFileNumber(), {
    headers: getHeaders,
  })
    .then((response) => response.json())
    .then((response) => {
      hidePreLoader();
      console.log(JSON.stringify(response));
      if (response.message == "success") {
        base64ToPdf(response.pdfString, fileName);
      } else {
        customAlert(response.errorDescription);
      }
    })
    .catch((err) => {
      hidePreLoader();
      console.log(err);
      customAlert(MESSAGES.GET_CERTIFICATE_API_FAILED);
    });
}

function getFileNumber() {
  return document.getElementById("index_verify_file_id").value;
}

function base64ToPdf(base64String, title) {
  var linkSource = `data:application/pdf;base64,${base64String}`;
  var downloadLink = document.createElement("a");
  downloadLink.href = linkSource;
  downloadLink.download = title + getFileNumber() + ".pdf";
  downloadLink.click();
}

function getUserInfo() {
  var userInfo = sessionStorage.getItem("userInfo");
  if (userInfo == null || userInfo == undefined || userInfo == {}) {
    location.href = location.origin + CONSTANTS.SIGN_IN_PAGE;
    return;
  }
  return JSON.parse(userInfo);
}

function saveUserInfo() {
  var userInfo = sessionStorage.getItem("userInfo");
  if (userInfo == null || userInfo == undefined || userInfo == {}) {
    location.href = location.origin + CONSTANTS.SIGN_IN_PAGE;
    return;
  }
  return JSON.parse(userInfo);
}

function onFileIdSubmit(event) {
  event.preventDefault();
  console.log(event);
  if (
    document.getElementById("index_verify_file_btn").innerText ==
    "Generate New Certificate"
  ) {
    customAlertWithCallBack(MESSAGES.GENERATE_NEW_PDF_WARNING, () => logout());
  } else {
    validateFileNumberBySOACert();
  }
}

function validateFileNumberBySOACert() {
  showPreLoader();
  fetch(API_ENDPOINTS.GET_SOA + getFileNumber(), {
    headers: getHeaders,
  })
    .then((response) => response.json())
    .then((json) => {
      if (json.message == "success") {
        validateFileResponse();
      } else {
        validateFileNumberByITCert();
      }
    })
    .catch((err) => {
      console.log(err);
      validateFileNumberByITCert();
    });
}

function validateFileNumberByITCert() {
  fetch(API_ENDPOINTS.GET_IT_CERTIFICATE + getFileNumber(), {
    headers: getHeaders,
  })
    .then((response) => response.json())
    .then((json) => {
      if (json.message == "success") {
        validateFileResponse();
      } else {
        validateFileNumberByProvisionalCert();
      }
    })
    .catch((err) => {
      console.log(err);
      validateFileNumberByProvisionalCert();
    });
}

function validateFileNumberByProvisionalCert() {
  fetch(API_ENDPOINTS.GET_PROVISIONAL_CERTIFICATE + getFileNumber(), {
    headers: getHeaders,
  })
    .then((response) => response.json())
    .then((json) => {
      hidePreLoader();
      if (json.message == "success") {
        validateFileResponse();
      } else {
        customAlert(MESSAGES.INVALID_FILE_NUMBER);
      }
    })
    .catch((err) => {
      hidePreLoader();
      console.log(err);
      customAlert(MESSAGES.API_FAILED_MESSAGE);
    });
}

function validateFileResponse() {
  hidePreLoader();
  userInfo = getUserInfo();
  var element = document.getElementById("index_verify_file_id");
  var fileNumber = element.value;
  userInfo.fileNumber = fileNumber;
  sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
  element.disabled = true;
  document.getElementById("index_verify_file_btn").innerText =
    "Generate New Certificate";
  showDownload();
}

function logout() {
  sessionStorage.clear();
  location.href = location.origin + CONSTANTS.SIGN_IN_PAGE;
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
  var textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

window.addEventListener("unload", () => {
  sessionStorage.setItem("intervalId", timerId);
});

function showDownload() {
  document.getElementById("index_download").style.display = "block";
}

function hideDownload() {
  document.getElementById("index_download").style.display = "none";
}

window.onload = function () {
  startTimer(CONSTANTS.SESSION_TIMEOUT);
  var userInfo = sessionStorage.getItem("userInfo");
  if (userInfo == undefined || userInfo == undefined || userInfo == {}) {
    location.href = location.origin + CONSTANTS.SIGN_IN_PAGE;
    return;
  }
  user = JSON.parse(userInfo);
  var fileNumber = user.fileNumber;
  if (fileNumber) {
    document.getElementById("index_verify_file_id").value = fileNumber;
    document.getElementById("index_verify_file_btn").innerText =
      "Generate New Certificate";
    document.getElementById("index_verify_file_id").disabled = true;
    showDownload();
  } else {
    hideDownload();
  }
};
