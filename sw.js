self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open("pages").then(c=>c.add("./schedules.html")).catch(()=>{}))});
// Mở được khi không có mạng: ưu tiên bản mới nhất từ mạng, mất mạng thì dùng bản đã lưu.
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open("pages").then(x=>x.put(e.request,c)).catch(()=>{});return r})
    .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(m=>m||caches.match("./schedules.html"))));
});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("push",e=>e.waitUntil((async()=>{
  let list=[];
  try{
    const c=await(await caches.open("cfg")).match(self.registration.scope+"cfg"),cfg=c?await c.json():null,
      sub=await self.registration.pushManager.getSubscription();
    if(cfg&&sub)list=await(await fetch(cfg.srv+"/ready?ep="+encodeURIComponent(sub.endpoint))).json();
  }catch(x){}
  if(!list.length)list=[{t:"Đã đến giờ một việc",k:"",r:"Mở ứng dụng để xem chi tiết",tag:"nl"}];
  await Promise.all(list.map(i=>self.registration.showNotification(
    (i.k==="s"?"⏰ Bắt đầu: ":i.k==="e"?"⏰ Kết thúc: ":"⏰ ")+i.t,
    {body:i.r,tag:i.tag,renotify:true,requireInteraction:true,vibrate:[250,120,250]})));
})()));
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{
    for(const c of l){if("focus"in c)return c.focus()}
    if(self.clients.openWindow)return self.clients.openWindow("./");
  }));
});
