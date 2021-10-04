import { ISharedFunction } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { SharedFunctionStub } from './SharedFunctionStub';
import { FunctionBodyType } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';

export class SharedFunctionCollectionStub implements ISharedFunctionCollection {
    private readonly functions = new Map<string, ISharedFunction>();
    public withFunction(...funcs: readonly ISharedFunction[]) {
        for (const func of funcs) {
            this.functions.set(func.name, func);
        }
        return this;
    }
    public getFunctionByName(name: string): ISharedFunction {
        if (this.functions.has(name)) {
            return this.functions.get(name);
        }
        return new SharedFunctionStub(FunctionBodyType.Code)
            .withName(name)
            .withCode('code by SharedFunctionCollectionStub')
            .withRevertCode('revert-code by SharedFunctionCollectionStub');
    }
}
