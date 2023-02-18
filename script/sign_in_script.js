function sendOTP(mobile, customerId) {
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
        sessionStorage.setItem("userInfo", JSON.stringify(response));
        sessionStorage.setItem("isOTPSendSuccess", "true");
        sessionStorage.setItem("startTime", Date.now());
        location.href = location.origin + CONSTANTS.OTP_VARIFICATION_PAGE;
      } else {
        customAlert(MESSAGES.INVALID_USERNAME_PASSWORD);
      }
    })
    .catch((err) => {
      hidePreLoader();
      console.error(err);
      customAlert(MESSAGES.API_FAILED_MESSAGE);
    });
}

// Check if OTP is already verified
if (sessionStorage.getItem("isOTPVerified") === "true") {
  location.href = location.origin + CONSTANTS.HOME_PAGE;
} else {
  clearSession();
}

function onSendOTPClick(event) {
  event.preventDefault();
  var customerId = document.getElementById("sign_in_customer_id").value;
  var mobile = document.getElementById("sign_in_mobile").value;
  console.log(customerId, mobile);
  // sendOTP("9820950933", "050096282")
  sendOTP(mobile, customerId);
}

// Scroll bar
var win = navigator.platform.indexOf("Win") > -1;
if (win && document.querySelector("#sidenav-scrollbar")) {
  var options = {
    damping: "0.5",
  };
  Scrollbar.init(document.querySelector("#sidenav-scrollbar"), options);
}
