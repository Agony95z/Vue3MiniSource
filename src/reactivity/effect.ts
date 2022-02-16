import { extend } from "../shared";

let activeEffect;
let shouldTrack;
class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: () => void
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    activeEffect = this
    if (!this.active) {
      return this._fn()
    }
    shouldTrack = true
    activeEffect = this
    const result = this._fn()
    // reset
    shouldTrack = false
    return result
  }
  // 清除effect副作用 比如 更改响应式数据 不去触发effect副作用 stop(runner) runner为函数副作用 也就是effect的入参 -- 回调函数
  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

// 清除deps 中的 effect
function cleanupEffect (effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  });
  effect.deps.length = 0
}
const targetMap = new Map()
export function track (target, key) {
  if (!activeEffect) return; // 针对单纯的触发reactive中的get--track而没有触发effect副作用 也就不存在activeEffect
  if (!shouldTrack) return;
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  if (dep.has(activeEffect)) return;
  dep.add(activeEffect) // 收集effect副作用
  activeEffect.deps.push(dep) // 收集dep
}

export function trigger (target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  for (const effect of dep) {
    if (effect.scheduler) { // effect 传入第二个参数执行第二个参数
      effect.scheduler()
    } else { // 否则执行第一个参数
      effect.run()
    }
  }
}

export function effect (fn, options:any = {}) {
  // const scheduler = options.scheduler;
  // fn
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // _effect.onStop = options.onStop
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect) // 绑定run方法里的this指针
  runner.effect = _effect
  return runner
}

export function stop (runner) {
  runner.effect.stop()
}
