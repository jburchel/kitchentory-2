const CACHE_NAME = 'kitchentory-v1';
const STATIC_CACHE_NAME = 'kitchentory-static-v1';
const DYNAMIC_CACHE_NAME = 'kitchentory-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/inventory',
  '/shopping-lists',
  '/onboarding',
  '/offline',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
  '/_next/static/css/app/globals.css',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/.*\.convex\.cloud\/api\/.*/,
  /^\/api\/.*/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

// Handle static assets (CSS, JS, images)
function handleStaticAsset(request) {
  return caches.match(request)
    .then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(request)
        .then((fetchResponse) => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(STATIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return fetchResponse;
        });
    })
    .catch(() => {
      // Return a fallback for images
      if (request.destination === 'image') {
        return new Response(
          '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy="0.3em" fill="#9ca3af">No Image</text></svg>',
          { headers: { 'Content-Type': 'image/svg+xml' } }
        );
      }
    });
}

// Handle API requests with network-first strategy
function handleApiRequest(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseClone);
          });
      }
      return response;
    })
    .catch(() => {
      return caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Add a header to indicate this is from cache
            const headers = new Headers(cachedResponse.headers);
            headers.set('X-From-Cache', 'true');
            
            return new Response(cachedResponse.body, {
              status: cachedResponse.status,
              statusText: cachedResponse.statusText,
              headers: headers
            });
          }
          
          // Return offline message for API requests
          return new Response(
            JSON.stringify({ 
              error: 'Offline', 
              message: 'No internet connection available' 
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        });
    });
}

// Handle page requests with cache-first for better performance
function handlePageRequest(request) {
  return caches.match(request)
    .then((response) => {
      if (response) {
        // Fetch in background to update cache
        fetch(request)
          .then((fetchResponse) => {
            if (fetchResponse.ok) {
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, fetchResponse.clone());
                });
            }
          })
          .catch(() => {});
        
        return response;
      }
      
      return fetch(request)
        .then((fetchResponse) => {
          if (fetchResponse.ok) {
            const responseClone = fetchResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return fetchResponse;
        })
        .catch(() => {
          // Return offline page
          return caches.match('/offline')
            .then((offlinePage) => {
              return offlinePage || new Response(
                '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
        });
    });
}

// Handle other requests
function handleOtherRequest(request) {
  return fetch(request)
    .catch(() => {
      return caches.match(request);
    });
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/_next/static/') ||
         url.pathname.includes('/icons/') ||
         url.pathname.includes('/images/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.webp');
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
         url.pathname.startsWith('/api/');
}

function isPageRequest(request) {
  const url = new URL(request.url);
  return request.destination === 'document' ||
         (request.headers.get('accept') && 
          request.headers.get('accept').includes('text/html'));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'inventory-sync') {
    event.waitUntil(syncInventoryData());
  } else if (event.tag === 'shopping-list-sync') {
    event.waitUntil(syncShoppingListData());
  }
});

// Sync inventory data when back online
async function syncInventoryData() {
  try {
    const pendingItems = await getStoredPendingItems('inventory');
    
    for (const item of pendingItems) {
      try {
        const response = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          await removePendingItem('inventory', item.id);
          console.log('Service Worker: Synced inventory item:', item.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync inventory item:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error during inventory sync:', error);
  }
}

// Sync shopping list data when back online
async function syncShoppingListData() {
  try {
    const pendingItems = await getStoredPendingItems('shopping');
    
    for (const item of pendingItems) {
      try {
        const response = await fetch('/api/shopping-lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          await removePendingItem('shopping', item.id);
          console.log('Service Worker: Synced shopping list item:', item.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync shopping list item:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error during shopping list sync:', error);
  }
}

// Helper functions for IndexedDB operations
async function getStoredPendingItems(type) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kitchentory-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([`pending-${type}`], 'readonly');
      const store = transaction.objectStore(`pending-${type}`);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(`pending-${type}`)) {
        db.createObjectStore(`pending-${type}`, { keyPath: 'id' });
      }
    };
  });
}

async function removePendingItem(type, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kitchentory-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([`pending-${type}`], 'readwrite');
      const store = transaction.objectStore(`pending-${type}`);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'You have items expiring soon!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Items',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Kitchentory Alert', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/inventory?filter=expiring')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});