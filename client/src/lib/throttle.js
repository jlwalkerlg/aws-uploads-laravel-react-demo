export default function throttle(handler, delay) {
  let nextRequest = 0;
  let now;

  return function(...args) {
    now = Date.now();
    if (now > nextRequest) {
      nextRequest = now + delay;
      handler.call(this, ...args);
    }
  };
}
