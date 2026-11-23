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
}

initPage();

async function navigateWithoutReload(url, addHistory=true){
  if(location.protocol==='file:' || url.origin!==location.origin) return false;
  if(document.startViewTransition && !prefersReducedMotion){
    const response=await fetch(url.href,{headers:{'X-Requested-With':'RishabhSite'}});
    if(!response.ok) return false;
    const html=await response.text();
    const nextDocument=new DOMParser().parseFromString(html,'text/html');
    const nextBody=nextDocument.body;
    await document.startViewTransition(()=>{
      document.title=nextDocument.title;
      document.documentElement.className=nextDocument.documentElement.className;
      document.body.className=nextBody.className;
      document.body.innerHTML=nextBody.innerHTML;
      if(addHistory) history.pushState({},'',url.href);
      initPage();
      if(url.hash){
        requestAnimationFrame(()=>document.querySelector(url.hash)?.scrollIntoView({block:'start'}));
      }else{
        window.scrollTo({top:0,behavior:'instant'});
      }
    }).finished;
    return true;
  }
  document.body.classList.add('page-leaving');
  await new Promise(resolve=>setTimeout(resolve,prefersReducedMotion?0:180));
  location.href=url.href;
  return true;
}

document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if(link.target && link.target!=='_self') return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin || url.pathname===location.pathname && url.hash && link.getAttribute('href')?.startsWith('#')) return;
  if(url.protocol==='mailto:' || url.protocol==='tel:' || url.pathname===location.pathname && url.hash) return;
  event.preventDefault();
  navigateWithoutReload(url);
});

window.addEventListener('popstate',()=>{
  navigateWithoutReload(new URL(location.href),false);
});
