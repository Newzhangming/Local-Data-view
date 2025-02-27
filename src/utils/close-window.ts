export const closeWindow = () => {
  window.close();
  window.open('', '_self');
  window.opener = null;
};
