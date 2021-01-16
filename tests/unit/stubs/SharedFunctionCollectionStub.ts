import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';

export class SharedFunctionCollectionStub implements ISharedFunctionCollection {
    private readonly functions = new Map<string, ISharedFunction>();
    public withFunction(func: ISharedFunction) {
        this.functions.set(func.name, func);
        return this;
    }
    public getFunctionByName(name: string): ISharedFunction {
        if (this.functions.has(name)) {
            return this.functions.get(name);
        }
        return {
            name,
            parameters: [],
            code: 'code by SharedFunctionCollectionStub',
            revertCode: 'revert-code by SharedFunctionCollectionStub',
        };
    }
}
