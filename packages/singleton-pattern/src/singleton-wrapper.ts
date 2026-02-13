class Singletonify {
  private readonly p2c = new WeakMap<ProxiedClass, Class>();
  private readonly c2p = new WeakMap<Class, ProxiedClass>();

  singletonify<T extends Class>(target: T, options?: SingletonifyOptions): T {
    const { changeProtoConstructor = true, onlyOnce = true } = Object(options);

    if (onlyOnce && this.c2p.has(target)) {
      return this.c2p.get(target) as T;
    }

    let instance: any;
    const proxied = new Proxy(target, {
      construct(cls, args) {
        if (!instance) {
          instance = new cls(...args);
        }
        return instance;
      },
    });

    if (changeProtoConstructor) {
      proxied.prototype.constructor = proxied;
    }

    if (onlyOnce) {
      this.p2c.set(proxied, target);
      this.c2p.set(target, proxied);
    }

    return proxied;
  }

  getSingletonTarget<T extends Class>(singleton: T): T | undefined {
    return this.p2c.get(singleton) as T | undefined;
  }
}

const instance = new Singletonify();

/**
 * ## Usage
 * Just wrap your class with this function to create a new class that always returns the same instance
 * @param target The class to be wrapped
 * @param options Advanced options
 * - changeProtoConstructor(default: `true`) will set `target.prototype.constructor` to the singletonified class
 * - onlyOnce(default: `true`) will cache the input and always return the same proxied class
 *
 * __PKG_INFO__
 */
export const singletonify = instance.singletonify.bind(instance);

/**
 * Retrieves the original class from the singletonified class
 * @param singleton The singletonified class
 * @returns `undefined` if the class is not singletonified, otherwise returns the original class
 */
export const getSingletonTarget = instance.getSingletonTarget.bind(instance);
