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

const pageCache=new Map();

function nextBodyFor(documentRef){
  return documentRef.body;
}

async function getPageHtml(url){
  if(pageCache.has(url.href)) return pageCache.get(url.href);
  const response=await fetch(url.href,{cache:'force-cache',credentials:'same-origin'});
  if(!response.ok) throw new Error(`Navigation failed: ${response.status}`);
  const html=await response.text();
  pageCache.set(url.href,html);
  return html;
}

async function preloadNextPage(documentRef,url){
  const assets=[...documentRef.querySelectorAll('link[rel="stylesheet"]')]
    .map(element=>{
      const value=element.href||element.src;
      if(!value) return null;
      return new URL(value,url.href);
    })
    .filter(value=>value&&value.origin===location.origin);

  await Promise.all(assets.map(asset=>{
    if(asset.pathname.endsWith('.css')){
      return new Promise(resolve=>{
        const link=document.createElement('link');
        link.rel='stylesheet';
        link.href=asset.href;
        link.onload=resolve;
        link.onerror=resolve;
        if(![...document.styleSheets].some(sheet=>sheet.href===link.href)){
          document.head.appendChild(link);
        }else{
          resolve();
        }
      });
    }
    return Promise.resolve();
  }));
}

async function navigateWithoutReload(url, addHistory=true){
  if(location.protocol==='file:' || url.origin!==location.origin) return false;
  document.documentElement.classList.add('navigation-starting');

  try{
    const html=await getPageHtml(url);
    const nextDocument=new DOMParser().parseFromString(html,'text/html');
    await preloadNextPage(nextDocument,url);

    if(document.startViewTransition && !prefersReducedMotion){
      await document.startViewTransition(()=>{
        document.title=nextDocument.title;
        document.documentElement.className=nextDocument.documentElement.className;
        document.body.className=nextBodyFor(nextDocument).className;
        document.body.innerHTML=nextBodyFor(nextDocument).innerHTML;
        if(addHistory) history.pushState({},'',url.href);
        initPage();
        if(url.hash){
          requestAnimationFrame(()=>document.querySelector(url.hash)?.scrollIntoView({block:'start'}));
        }else{
          window.scrollTo({top:0,behavior:'instant'});
        }
      }).finished;
    }else{
      document.body.classList.add('page-leaving');
      await new Promise(resolve=>setTimeout(resolve,140));
      document.title=nextDocument.title;
      document.documentElement.className=nextDocument.documentElement.className;
      document.body.className=nextBodyFor(nextDocument).className;
      document.body.innerHTML=nextBodyFor(nextDocument).innerHTML;
      if(addHistory) history.pushState({},'',url.href);
      initPage();
      window.scrollTo({top:0,behavior:'instant'});
      document.body.classList.remove('page-leaving');
    }
    document.documentElement.classList.remove('navigation-starting');
    return true;
  }catch(error){
    document.documentElement.classList.remove('navigation-starting');
    location.href=url.href;
    return true;
  }
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

document.addEventListener('pointerover',event=>{
  const link=event.target.closest('a[href]');
  if(!link || link.target && link.target!=='_self') return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin || url.hash) return;
  getPageHtml(url).catch(()=>{});
},{passive:true});

window.addEventListener('popstate',()=>{
  navigateWithoutReload(new URL(location.href),false);
});
