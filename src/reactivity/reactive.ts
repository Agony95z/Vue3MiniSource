import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlag {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

// reactive
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

// readonly
export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

// isReactive
export function isReactive(value) {
  return !!value[ReactiveFlag.IS_REACTIVE] // !! 普通对象不会触发reactive中的get 直接访问value['__v_isReactive']值为undefined 返回false
}

// isReadonly
export function isReadonly(value) {
  return !!value[ReactiveFlag.IS_READONLY]
}

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers)
}