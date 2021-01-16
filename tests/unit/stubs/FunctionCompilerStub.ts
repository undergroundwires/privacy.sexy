import { IFunctionCompiler } from '@/application/Parser/Script/Compiler/Function/IFunctionCompiler';
import { ISharedFunctionCollection } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionCollection';
import { FunctionData } from 'js-yaml-loader!*';
import { SharedFunctionCollectionStub } from './SharedFunctionCollectionStub';

export class FunctionCompilerStub implements IFunctionCompiler {
    private setupResults = new Array<{
        functions: readonly FunctionData[],
        result: ISharedFunctionCollection,
    }>();

    public setup(functions: readonly FunctionData[], result: ISharedFunctionCollection) {
        this.setupResults.push( { functions, result });
    }

    public compileFunctions(functions: readonly FunctionData[]): ISharedFunctionCollection {
        const result = this.findResult(functions);
        return result || new SharedFunctionCollectionStub();
    }

    private findResult(functions: readonly FunctionData[]): ISharedFunctionCollection {
        for (const result of this.setupResults) {
            if (sequenceEqual(result.functions, functions)) {
                return result.result;
            }
        }
        return undefined;
    }
}

function sequenceEqual<T>(array1: readonly T[], array2: readonly T[]) {
    if (array1.length !== array2.length) {
        return false;
    }
    const sortedArray1 = sort(array1);
    const sortedArray2 = sort(array2);
    return sortedArray1.every((val, index) => val === sortedArray2[index]);
    function sort(array: readonly T[]) {
        return array.slice().sort();
    }
}
