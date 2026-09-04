// Login to the admin panel via React-compatible value setting
// Usage: node scripts/login-admin.mjs [email] [password]
const email = process.argv[2] || "akihabaratcgwarehouse1@gmail.com";
const password = process.argv[3] || "Akihabarat1$";

function setReactValue(el, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

const inputs = document.querySelectorAll("input");
setReactValue(inputs[0], EMAIL_PLACEHOLDER);
setReactValue(inputs[1], PASSWORD_PLACEHOLDER);
JSON.stringify({ email: inputs[0].value, pw: inputs[1].value });
