const year=document.querySelector('[data-year]');
if(year)year.textContent=new Date().getFullYear();
if(document.querySelector('link[href="styles.css"]')){
  const theme=document.createElement('link');
  theme.rel='stylesheet';
  theme.href='theme.css';
  document.head.appendChild(theme);
}
