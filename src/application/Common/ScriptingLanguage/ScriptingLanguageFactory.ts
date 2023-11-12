import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { assertInRange } from '@/application/Common/Enum';
import { IScriptingLanguageFactory } from './IScriptingLanguageFactory';

type Getter<T> = () => T;

export abstract class ScriptingLanguageFactory<T> implements IScriptingLanguageFactory<T> {
  private readonly getters = new Map<ScriptingLanguage, Getter<T>>();

  public create(language: ScriptingLanguage): T {
    assertInRange(language, ScriptingLanguage);
    const getter = this.getters.get(language);
    if (!getter) {
      throw new RangeError(`unknown language: "${ScriptingLanguage[language]}"`);
    }
    const instance = getter();
    return instance;
  }

  protected registerGetter(language: ScriptingLanguage, getter: Getter<T>) {
    assertInRange(language, ScriptingLanguage);
    if (this.getters.has(language)) {
      throw new Error(`${ScriptingLanguage[language]} is already registered`);
    }
    this.getters.set(language, getter);
  }
}
