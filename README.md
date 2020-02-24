# wheel-dragging

![npm](https://img.shields.io/npm/v/wheel-dragging)

## Motivation

[The specification of drag and drop](https://html.spec.whatwg.org/multipage/dnd.html#drag-and-drop-processing-model) has the following description.

> From the moment that the user agent is to initiate the drag-and-drop operation, until the end of the drag-and-drop operation, device input events (e.g. mouse and keyboard events) must be suppressed.

A bad consequence of this restriction is that mousewheel can't be used to scroll pages or containers while dragging something.
If you use [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) to sort a list that owns a large number of items, it will lead to a bad UX.

* [DEMO that can confirm the restriction](https://cannotbedragged.now.sh/)

## Outline

This package provides methods that allows you to turn [WheelEvent](https://developer.mozilla.org/ja/docs/Web/API/WheelEvent) on and off at any time.

## Installation

```
$ npm i wheel-dragging
```

## Usage

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="draggable">
  </body>
</html>
```

```js
import WheelDragging from "wheel-dragging";

// You should create a instance after DOMContentLoaded.
const wheelDragging = new WheelDragging();

// The events you want to monitor need to be added after this method is called.
wheelDragging.init();

const target = document.getElementById("draggable");

target.addEventListener("dragstart", () => {
  wheelDragging.removeWheelListeners();
});
target.addEventListener("dragend", () => {
  wheelDragging.restoreWheelListeners();
});
```

By adding EventMap to the constructor argument, it is possible to omit the method execution.

```js
const wheelDragging = new WheelDragging(["dragstart"], ["dragend"]);
```

## Note

- Events must be assigned after the init method of this package is called.
- Events in Iframes can also be monitored. However, follow the above rules for assigning events.
