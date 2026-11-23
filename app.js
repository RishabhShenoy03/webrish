const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let headerAvatarObserver;

function initPage(){
  const year=document.querySelector('[data-year]');
  if(year) year.textContent=new Date().getFullYear();
  document.body.classList.remove('page-leaving');

  const portrait=document.querySelector('.home-page .hero-portrait');
  const headerAvatar=document.querySelector('.home-page .header-avatar');
  if(headerAvatarObserver){
    headerAvatarObserver.disconnect();
    headerAvatarObserver=null;
  }
  if(portrait&&headerAvatar){
    headerAvatarObserver=new IntersectionObserver(([entry])=>headerAvatar.classList.toggle('visible',!entry.isIntersecting),{threshold:.12});
    headerAvatarObserver.observe(portrait);
  }

  const header=document.querySelector('.site-header');
  if(header){
    const updateHeader=()=>{
      const portraitBottom=portrait?.getBoundingClientRect().bottom ?? 0;
      header.classList.toggle('scrolled',window.scrollY>24 && (!portrait || portraitBottom<84));
    };
    window.removeEventListener('scroll',window.__rishabhHeaderScroll);
    window.__rishabhHeaderScroll=updateHeader;
    window.addEventListener('scroll',updateHeader,{passive:true});
    updateHeader();
  }
}

initPage();

async function navigateWithFade(url){
  if(location.protocol==='file:' || url.origin!==location.origin) return;
  document.documentElement.classList.add('navigation-starting');
  document.body.classList.add('page-leaving');
  await new Promise(resolve=>setTimeout(resolve,prefersReducedMotion?0:140));
  location.href=url.href;
}

document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if(link.target && link.target!=='_self') return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin || url.pathname===location.pathname && url.hash && link.getAttribute('href')?.startsWith('#')) return;
  if(url.protocol==='mailto:' || url.protocol==='tel:' || url.pathname===location.pathname && url.hash) return;
  event.preventDefault();
  navigateWithFade(url);
});
