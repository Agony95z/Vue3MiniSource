import { track, trigger } from "./effect";
import { ReactiveFlag } from "./reactive";

const get = createGetter() // 缓存 省的每次都要重新调用
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlag.IS_REACTIVE) { // 判断对象是否是isReactive
      return !isReadonly;
    } else if (key === ReactiveFlag.IS_READONLY) { // 判断对象是否是isReadonly
      return isReadonly;
    }
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      // TODO 依赖收集
      track(target, key)
    }
    return res;
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    // TODO 触发依赖
    trigger(target, key);
    return res;
  }
}

export const mutableHandlers = {
  get,
  set,
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key: ${key} set 失败 因为target是readonly`, target)
    return true;
  }
}