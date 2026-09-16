/* ═══ Service Worker بسيطة — ده اللي بيفضل شغال في الخلفية ويستقبل الإشعارات الحقيقية
   حتى لو التطبيق مقفول تمامًا أو انت فاتح تطبيق تاني ═══ */

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

// بيوصل هنا كل مرة السيرفر يبعت إشعار حقيقي (Web Push) — ده بيشتغل حتى والتطبيق مقفول
self.addEventListener('push', (event) => {
  let data = { title: 'بسيطة', body: 'عندك تحديث جديد', url: '/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || undefined,
    badge: data.badge || undefined,
    dir: 'rtl',
    lang: 'ar',
    data: { url: data.url || '/' },
    // نغمة/اهتزاز قوي ومتكرر — أهم حاجة إن التاجر أو المندوب يحس بيها حتى لو التليفون في الجيب
    vibrate: [400, 150, 400, 150, 400, 150, 200],
    requireInteraction: true, // الإشعار فاضل ظاهر لحد ما يتفاعل معاه، مش بيختفي وحده بسرعة
    silent: false,
    renotify: true,
    tag: data.tag || ('basita-' + Date.now()),
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// لما المستخدم يدوس على الإشعار — يفتحله التطبيق أو يرجّعله للتاب المفتوحة بالفعل
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl.split('?')[0]) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
