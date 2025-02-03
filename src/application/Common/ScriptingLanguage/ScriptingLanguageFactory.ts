import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { assertInRange } from '@/application/Common/Enum';
import type { IScriptingLanguageFactory } from './IScriptingLanguageFactory';

type Getter<T> = () => T;

export abstract class ScriptingLanguageFactory<T> implements IScriptingLanguageFactory<T> {
  private readonly getters = new Map<ScriptLanguage, Getter<T>>();

  public create(language: ScriptLanguage): T {
    assertInRange(language, ScriptLanguage);
    const getter = this.getters.get(language);
    if (!getter) {
      throw new RangeError(`unknown language: "${ScriptLanguage[language]}"`);
    }
    const instance = getter();
    return instance;
  }

  protected registerGetter(language: ScriptLanguage, getter: Getter<T>) {
    assertInRange(language, ScriptLanguage);
    if (this.getters.has(language)) {
      throw new Error(`${ScriptLanguage[language]} is already registered`);
    }
    this.getters.set(language, getter);
  }
}
