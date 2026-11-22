const year=document.querySelector('[data-year]');
if(year)year.textContent=new Date().getFullYear();
if(document.querySelector('link[href="styles.css"]')){
  const theme=document.createElement('link');
  theme.rel='stylesheet';
  theme.href='theme.css';
  document.head.appendChild(theme);
}
const portrait=document.querySelector('.home-page .hero-portrait');
const headerAvatar=document.querySelector('.home-page .header-avatar');
if(portrait&&headerAvatar){
  const observer=new IntersectionObserver(([entry])=>headerAvatar.classList.toggle('visible',!entry.isIntersecting),{threshold:.12});
  observer.observe(portrait);
}
