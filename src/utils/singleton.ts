export default class Singleton {
  private static instance: Singleton;
  private mappings: Map<string, string | number> = new Map();

  private constructor() {}

  public static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  public set(key: string, value: string | number): void {
    this.mappings.set(key, value);
  }

  public get(key: string) {
    return this.mappings.get(key);
  }
}
