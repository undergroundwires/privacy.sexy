import { ref } from 'vue';
import { useCurrentCode } from '@/presentation/components/Shared/Hooks/UseCurrentCode';

export class UseCurrentCodeStub {
  public currentCodeRef = ref('');

  public withCurrentCode(code: string): this {
    this.currentCodeRef.value = code;
    return this;
  }

  public get(): ReturnType<typeof useCurrentCode> {
    return {
      currentCode: this.currentCodeRef,
    };
  }
}
