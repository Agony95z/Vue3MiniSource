class ReactiveEffect {
  private _fn: any
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    this._fn()
  }
}


const targetMap = new Map()
export function track (target, key) {
  // target -> key -> dep
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)
}

export function effect (fn) {
  // fn
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}