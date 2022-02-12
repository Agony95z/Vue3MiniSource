import { effect, stop } from "../effect";
import { reactive } from "../reactive";
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })
    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11);
    // update
    user.age++;
    expect(nextAge).toBe(12);
  });
  it('should return runner when call effect', () => {
    // 1. effect(fn) -> function(runner) -> fn -> return
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(11);
    let r = runner();
    expect(r).toBe("foo");
    expect(foo).toBe(12)
  });
  it("scheduler", () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner; // 调用scheduler 把() => {dummy = obj.foo;}复制给run 后面执行run 则执行() => {dummy = obj.foo;}()
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler } // 函数副作用传入scheduler 当触发响应式数据set--trigger的时候 才会调用scheduler
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1); // 调用schedule 而不是调用() => {dummy = obj.foo;}
    // // should not run yet
    expect(dummy).toBe(1);
    // // manually run
    run(); // 执行() => {dummy = obj.foo;}
    // // should have run
    expect(dummy).toBe(2);
  });
  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    // obj.prop = 3
    expect(dummy).toBe(2);
    obj.prop++;

    // stopped effect should still be manually callable
    runner();
    expect(dummy).toBe(3);
  });
  it("events: onStop", () => { // 调用stop之后的一个回调函数
    const onStop = jest.fn();
    const runner = effect(() => {}, {
      onStop,
    });

    stop(runner);
    expect(onStop).toHaveBeenCalled();
  });
});