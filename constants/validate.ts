export const VALIDATE = {
  EMAIL: /^\s*[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\s*$/i,
  NAME: /^[A-Za-z0-9\u00C0-\u1EF9 ]{1,50}$/,
  PASSWORD: /^[a-zA-Z0-9!@#$%^&*()_+{}[\]:;<>,.?~\\-]{8,50}$/,
  PHONE: /^[0-9]{10,11}$/,
};
