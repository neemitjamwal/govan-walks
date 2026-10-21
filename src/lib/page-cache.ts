export interface PageCacheHandlers {
  /** The page is being hidden, possibly into the back/forward cache. */
  hide: () => void;
  /** The page came back from the back/forward cache with its old JavaScript state. */
  restore: () => void;
}

type PageTarget = Pick<EventTarget, 'addEventListener'>;

export function onPageCache(target: PageTarget, handlers: PageCacheHandlers): void {
  target.addEventListener('pagehide', () => handlers.hide());
  target.addEventListener('pageshow', (event) => {
    if ((event as PageTransitionEvent).persisted) handlers.restore();
  });
}
