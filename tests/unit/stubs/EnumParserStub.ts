import { IEnumParser } from '@/application/Common/Enum';

export function mockEnumParser<T>(inputName: string, inputValue: string, outputValue: T): IEnumParser<T> {
    return {
        parseEnum: (value, name) => {
            if (name !== inputName) {
                throw new Error(`Unexpected name: "${name}"`);
            }
            if (value !== inputValue) {
                throw new Error(`Unexpected value: "${value}"`);
            }
            return outputValue;
        },
    };
}
