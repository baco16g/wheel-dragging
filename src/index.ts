type EventMap = keyof HTMLElementEventMap;

export default class WheelDragging {
  private typeAllowDeletion: EventMap[];
  private typeAllowRestoration: EventMap[];
  private wheelEventTargets: {
    target: EventTarget;
    listener: EventListenerOrEventListenerObject | null;
    options?: boolean | AddEventListenerOptions;
  }[];
  private iframeObserver: MutationObserver | undefined;

  constructor(
    typeAllowDeletion?: EventMap[],
    typeAllowRestoration?: EventMap[]
  ) {
    this.typeAllowDeletion = typeAllowDeletion || [];
    this.typeAllowRestoration = typeAllowRestoration || [];
    this.wheelEventTargets = [];
    this.iframeObserver = undefined;
  }

  public init(): void {
    this.setCustomAddEventListener(window);
    this.iframeObserver = this.getIframeObserver();
    this.iframeObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  public get eventTargets(): WheelDragging["wheelEventTargets"] {
    return this.wheelEventTargets;
  }

  public set eventTargets(targets: WheelDragging["wheelEventTargets"]) {
    this.wheelEventTargets = targets;
  }

  public disconnect(): void {
    if (this.iframeObserver) this.iframeObserver.disconnect();
  }

  public restoreWheelListeners(): void {
    this.wheelEventTargets.forEach(({ target, listener, options }) => {
      if (!listener) return;
      target.addEventListener("wheel", listener, options);
    });
  }

  public removeWheelListeners(): void {
    this.wheelEventTargets.forEach(({ target, listener, options }) => {
      if (!listener) return;
      target.removeEventListener("wheel", listener, options);
    });
  }

  private setCustomAddEventListener(contentWindow: any): void {
    const originalAddEventListener =
      contentWindow.EventTarget.prototype.addEventListener;
    const self = this;
    contentWindow.EventTarget.prototype.addEventListener = function(
      type: EventMap,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions
    ) {
      if (type === "wheel") {
        self.wheelEventTargets.push({ target: this, listener, options });
      } else if (self.typeAllowDeletion.includes(type)) {
        self.removeWheelListeners();
      } else if (self.typeAllowRestoration.includes(type)) {
        self.restoreWheelListeners();
      }
      this.f = originalAddEventListener;
      this.f(type, listener, options);
    };
  }

  private getIframeObserver(): MutationObserver {
    return new MutationObserver(mutations => {
      const iframes: Node[] = [];
      const containIframes = (node: Node): boolean =>
        iframes.some(n => node.isEqualNode(n));
      const getIframe = (node: Node): HTMLIFrameElement | null => {
        if (node.nodeName === "IFRAME") return node as HTMLIFrameElement;
        if (!("querySelector" in node)) return null;
        const iframe = (node as Element).querySelector("iframe");
        return iframe;
      };
      mutations.forEach(m => {
        Array.from(m.addedNodes)
          .map(getIframe)
          .filter(
            (iframe): iframe is HTMLIFrameElement =>
              !!iframe && !containIframes(iframe)
          )
          .forEach(iframe => {
            if (iframe.contentWindow)
              this.setCustomAddEventListener(iframe.contentWindow);
            iframes.push(iframe);
          });
      });
    });
  }
}
