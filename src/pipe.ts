const pipe =
  (...fns: Array<Function>) =>
  (x: Function) =>
    fns.reduce((v, f) => f(v), x);

export { pipe };
