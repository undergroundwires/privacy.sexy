import 'mocha';
import { expect } from 'chai';
import { INodeDataErrorContext, NodeDataError } from '@/application/Parser/NodeValidation/NodeDataError';
import { NodeDataErrorContextStub } from '@tests/unit/shared/Stubs/NodeDataErrorContextStub';
import { NodeType } from '@/application/Parser/NodeValidation/NodeType';

describe('NodeDataError', () => {
  it('sets message as expected', () => {
    // arrange
    const message = 'message';
    const context = new NodeDataErrorContextStub();
    const expected = `[${NodeType[context.type]}] ${message}`;
    // act
    const sut = new NodeDataErrorBuilder()
      .withContext(context)
      .withMessage(expected)
      .build();
    // assert
    expect(sut.message).to.include(expected);
  });
  it('sets context as expected', () => {
    // arrange
    const expected = new NodeDataErrorContextStub();
    // act
    const sut = new NodeDataErrorBuilder()
      .withContext(expected)
      .build();
    // assert
    expect(sut.context).to.equal(expected);
  });
  it('sets stack as expected', () => {
    // arrange
    // act
    const sut = new NodeDataErrorBuilder()
      .build();
    // assert
    expect(sut.stack !== undefined);
  });
  it('extends Error', () => {
    // arrange
    const expected = Error;
    // act
    const sut = new NodeDataErrorBuilder().build();
    // assert
    expect(sut).to.be.an.instanceof(expected);
  });
});

class NodeDataErrorBuilder {
  private message = 'error';

  private context: INodeDataErrorContext = new NodeDataErrorContextStub();

  public withContext(context: INodeDataErrorContext) {
    this.context = context;
    return this;
  }

  public withMessage(message: string) {
    this.message = message;
    return this;
  }

  public build(): NodeDataError {
    return new NodeDataError(this.message, this.context);
  }
}
