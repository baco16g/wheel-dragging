import WheelDragging from "../src/index";

describe("WheelDragging", () => {
  let instance: WheelDragging;
  let target: HTMLElement;
  const eventTargetId = "event-target";
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="${eventTargetId}"></div>
    `;
    target = document.getElementById(eventTargetId) as HTMLElement;
  });

  describe("init", () => {
    beforeEach(() => {
      instance = new WheelDragging(["dragstart"], ["dragend"]);
    });
    it("should add a target to wheelEventTargets when a wheel event is called", () => {
      expect(instance.eventTargets.length).toBe(0);
      instance.init();
      target.addEventListener("wheel", () => ({}));
      expect(instance.eventTargets.length).toBe(1);
    });

    it("should call removeWheelListeners when specific events is called", () => {
      const spy = jest.spyOn(WheelDragging.prototype, "removeWheelListeners");
      instance.init();
      target.addEventListener("dragstart", () => ({}));
      expect(spy).toHaveBeenCalled();
    });

    it("should call restoreWheelListeners when specific events is called", () => {
      const spy = jest.spyOn(WheelDragging.prototype, "restoreWheelListeners");
      instance.init();
      target.addEventListener("dragend", () => ({}));
      expect(spy).toHaveBeenCalled();
    });

    it("should call the original addEventListener when events is called", () => {
      const spy = jest.spyOn(window.EventTarget.prototype, "addEventListener");
      const [type, handler, options] = ["click", () => ({}), { passive: true }];
      instance.init();
      target.addEventListener(type, handler, options);
      expect(spy).toHaveBeenCalledWith(type, handler, options);
    });

    it("should add a target to wheelEventTargets when a wheel event is attached in HTMLIframeElement", () => {
      const iframe = document.createElement("iframe");
      expect(instance.eventTargets.length).toBe(0);
      instance.init();
      target.appendChild(iframe);
      iframe.contentDocument?.open();
      iframe.contentDocument?.write(`<html><body></body></html>`);
      iframe.contentDocument?.close();
      const iframeTarget = iframe.contentDocument?.createElement(
        "div"
      ) as HTMLDivElement;
      iframe.contentDocument?.body.appendChild(iframeTarget);
      iframeTarget.addEventListener("wheel", () => ({}));
      expect(instance.eventTargets.length).toBe(1);
    });
  });

  describe("restoreWheelListeners", () => {
    const expectedText = "wheel event was triggered";
    beforeEach(() => {
      instance = new WheelDragging();
    });

    it("should restore wheel events", () => {
      instance.eventTargets = [
        {
          target,
          listener: () => {
            target.textContent = expectedText;
          }
        }
      ];
      expect(target.textContent).not.toBe(expectedText);
      instance.restoreWheelListeners();
      target.dispatchEvent(new Event("wheel"));
      expect(target.textContent).toBe(expectedText);
    });
  });

  describe("removeWheelListeners", () => {
    const expectedText = "wheel event was triggered";
    beforeEach(() => {
      instance = new WheelDragging();
    });

    it("should emove wheel events", () => {
      const listener = () => {
        target.textContent = expectedText;
      };
      target.addEventListener("wheel", listener);
      instance.eventTargets = [
        {
          target,
          listener
        }
      ];
      target.textContent = "overwrite text";
      instance.removeWheelListeners();
      target.dispatchEvent(new Event("wheel"));
      expect(target.textContent).not.toBe(expectedText);
    });
  });
});
