var API_ENDPOINTS = {
  SEND_OTP: "https://freedomv2web.gichf.com:107/api/validateuser/1",
  VERIFY_OTP: "https://freedomv2web.gichf.com:107/api/validateuser/2",
  GET_SOA:
    "https://freedomv2web.gichf.com:107/api/StatusReport/",
  GET_PROVISIONAL_CERTIFICATE:
    "https://freedomv2web.gichf.com:107/api/ProvisionalCertificate/",
  GET_IT_CERTIFICATE:
    "https://freedomv2web.gichf.com:107/api/ITCertificate/",
};

var CONSTANTS = {
  IT_CERTIFICATE: "IT_CERTIFICATE_",
  PROVISIONAL_CERTIFICATE: "PROVISIONAL_CERTIFICATE_",
  STATEMENT_OF_ACCOUNT: "STATEMENT_",
  OTP_TIMEOUT: 60 * 10 * 1000, // 10 minutes
  SESSION_TIMEOUT: 60 * 15 * 1000, // 15 minutes
  RESEND_OTP_TIMEOUT: 60 * 2 * 1000, // 2 minutes
  SIGN_IN_PAGE: "/pages/sign-in.html",
  OTP_VARIFICATION_PAGE: "/pages/otpverification.html",
  HOME_PAGE: "/index.html",
};

var MESSAGES = {
  INVALID_FILE_NUMBER: "Invalid File Number",
  API_FAILED_MESSAGE: "Something went wrong, please try again later",
  GET_CERTIFICATE_API_FAILED:
    "Unable to fetch the document for this File number. Please contact your servicing GICHFL Branch",
  INVALID_OTP: "Invalid OTP, Please try again",
  OTP_SENT_SUCCESSFUL: "OTP Sent Successful",
  INVALID_USERNAME_PASSWORD: "Invalid Customer Id or Mobile Number",
  GENERATE_NEW_PDF_WARNING: "Please note: To generate a new certificate, you will need to log in again. When you click 'OK', you will be redirected to the login page.",
};

function getAuthToken() {
  return "DFA083645C094FA89A56BF6DAD3894EC";
}

var getHeaders = {
  SecurityToken: getAuthToken(),
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept",
};

var postHeaders = {
  ...getHeaders,
  "Content-Type": "application/json",
};

function clearSession() {
  sessionStorage.removeItem("startTime");
  sessionStorage.removeItem("isOTPVerified");
  sessionStorage.removeItem("userInfo");
  sessionStorage.removeItem("isOTPSendSuccess");
  sessionStorage.removeItem("isOTPVerified");
  const savedIntervalId = sessionStorage.getItem("intervalId");
  if (savedIntervalId) {
    clearInterval(savedIntervalId);
    sessionStorage.removeItem("intervalId");
  }
}

// Custome Alert POPUP
function customAlert(message) {
  // Create the overlay element
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "9998";

  // Add the overlay to the page
  document.body.appendChild(overlay);

  // Create the alert box element
  const alertBox = document.createElement("div");
  alertBox.style.position = "fixed";
  alertBox.style.top = "50%";
  alertBox.style.left = "50%";
  alertBox.style.transform = "translate(-50%, -50%)";
  alertBox.style.padding = "20px";
  alertBox.style.backgroundColor = "#ffffff";
  alertBox.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
  alertBox.style.borderRadius = "10px";
 
  alertBox.style.width = "400px";
  alertBox.style.maxHeight = "80%";
  alertBox.style.maxWidth = "95%";
  alertBox.style.overflow = "auto";
  alertBox.style.zIndex = "9999";
  alertBox.style.display = "flex";
  alertBox.style.flexDirection = "column";
  alertBox.style.alignItems = "center";

  // Create the message element
  const messageElement = document.createElement("p");
  messageElement.style.fontSize = "20px";
  messageElement.style.lineHeight = "1.5";
  messageElement.style.textAlign = "center";
  messageElement.textContent = message;
  alertBox.appendChild(messageElement);

  // Create the OK button element
  const okButton = document.createElement("button");
  okButton.textContent = "OK";
  okButton.style.marginTop = "20px";
  okButton.style.padding = "10px 20px";
  okButton.style.color = "#ffffff";
  okButton.style.border = "none";
  okButton.style.cursor = "pointer";
  okButton.style.fontSize = "18px";
  okButton.style.fontWeight = "bold";
  okButton.style.width = "100%";
  okButton.className = "btn bg-gradient-primary w-100 my-2 mb-2";
  okButton.addEventListener("click", function () {
    document.body.removeChild(alertBox);
    document.body.removeChild(overlay);
  });
  alertBox.appendChild(okButton);

  // Add the alert box to the page
  document.body.appendChild(alertBox);
}

function customAlertWithCallBack(message, callback) {
  // Create the overlay element
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "9998";

  // Add the overlay to the page
  document.body.appendChild(overlay);

  // Create the alert box element
  const alertBox = document.createElement("div");
  alertBox.style.position = "fixed";
  alertBox.style.top = "50%";
  alertBox.style.left = "50%";
  alertBox.style.transform = "translate(-50%, -50%)";
  alertBox.style.padding = "20px";
  alertBox.style.backgroundColor = "#ffffff";
  alertBox.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
  alertBox.style.borderRadius = "10px";
  alertBox.style.width = "400px";
  alertBox.style.maxWidth = "95%";
  alertBox.style.maxHeight = "80%";
  alertBox.style.overflow = "auto";
  alertBox.style.zIndex = "9999";
  alertBox.style.display = "flex";
  alertBox.style.flexDirection = "column";
  alertBox.style.alignItems = "center";

  // Create the message element
  const messageElement = document.createElement("p");
  messageElement.style.fontSize = "20px";
  messageElement.style.lineHeight = "1.5";
  messageElement.style.textAlign = "center";
  messageElement.textContent = message;
  alertBox.appendChild(messageElement);

  // Create the OK and cancel button elements
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";
  buttonContainer.style.width = "100%";
  alertBox.appendChild(buttonContainer);

  const okButton = document.createElement("button");
  okButton.textContent = "OK";
  okButton.style.padding = '10px 20px';
  okButton.style.backgroundColor = '#007bff';
  okButton.style.color = '#ffffff';
  okButton.style.border = 'none';
  okButton.style.borderRadius = '5px';
  okButton.style.cursor = 'pointer';
  okButton.style.fontSize = '18px';
  okButton.style.fontWeight = 'bold';
  okButton.style.width = '45%';
  okButton.addEventListener("click", function () {
    document.body.removeChild(alertBox);
    document.body.removeChild(overlay);
    if (callback) {
      callback();
    }
  });
  buttonContainer.appendChild(okButton);

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.style.padding = "10px 20px";
  cancelButton.style.backgroundColor = "#cccccc";
  cancelButton.style.color = "#333333";
  cancelButton.style.border = "none";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.cursor = "pointer";
  cancelButton.style.fontSize = "18px";
  cancelButton.style.fontWeight = "bold";
  cancelButton.style.width = "45%";
  cancelButton.addEventListener("click", function () {
    document.body.removeChild(alertBox);
    document.body.removeChild(overlay);
  });
  buttonContainer.appendChild(cancelButton);
  // Add the alert box to the page
  document.body.appendChild(alertBox);
}
function showPreLoader() {
  var preloader = document.getElementById("preloader");
  preloader.style.display = "block";
}
function hidePreLoader() {
  var preloader = document.getElementById("preloader");
  preloader.style.display = "none";
}
