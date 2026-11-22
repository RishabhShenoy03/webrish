const year=document.querySelector('[data-year]');if(year)year.textContent=new Date().getFullYear();
document.querySelectorAll('a').forEach(link=>{if(link.target==='_blank')link.setAttribute('aria-label',`${link.textContent.trim()} (opens in a new tab)`)});
