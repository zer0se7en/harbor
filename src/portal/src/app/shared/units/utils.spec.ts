import { delUrlParam, getQueryString, getSizeNumber, getSizeUnit, getSortingString, isSameArrayValue, isSameObject } from "./utils";
import { ClrDatagridStateInterface } from "@clr/angular";

describe('functions in utils.ts should work', () => {
  it('function isSameArrayValue() should work', () => {
    expect(isSameArrayValue).toBeTruthy();
    expect(isSameArrayValue(null, null)).toBeFalsy();
    expect(isSameArrayValue([], null)).toBeFalsy();
    expect(isSameArrayValue([1, 2, 3], [3 , 2, 1])).toBeTruthy();
    expect(isSameArrayValue([{a: 1, c: 2}, true], [true, {c: 2, a: 1, d: null}])).toBeTruthy();
  });

  it('function isSameObject() should work', () => {
    expect(isSameObject).toBeTruthy();
    expect(isSameObject(null, null)).toBeTruthy();
    expect(isSameObject({}, null)).toBeFalsy();
    expect(isSameObject(null, {})).toBeFalsy();
    expect(isSameObject([], null)).toBeFalsy();
    expect(isSameObject(null, [])).toBeFalsy();
    expect(isSameObject({a: 1, b: true}, {a: 1})).toBeFalsy();
    expect(isSameObject({a: 1, b: false}, {a: 1})).toBeFalsy();
    expect(isSameObject({a: [1, 2, 3], b: null}, {a: [3, 2, 1]})).toBeTruthy();
    expect(isSameObject({a: {a: 1 , b: 2}, b: null}, {a: {b: 2, a: 1}})).toBeTruthy();
    expect(isSameObject([1, 2, 3], [3 , 2, 1])).toBeFalsy();
  });

  it('function delUrlParam() should work', () => {
    expect(delUrlParam).toBeTruthy();
    expect(delUrlParam('http://test.com?param1=a&param2=b&param3=c', 'param2'))
      .toEqual('http://test.com?param1=a&param3=c');
    expect(delUrlParam('http://test.com', 'param2')).toEqual('http://test.com');
    expect(delUrlParam('http://test.com?param2', 'param2')).toEqual('http://test.com');
  });

  it('function getSortingString() should work', () => {
    expect(getSortingString).toBeTruthy();
    const state: ClrDatagridStateInterface = {
      sort: {
        by: 'name',
        reverse: true
      }
    };
    expect(getSortingString(state)).toEqual('-name');
  });

  it('function getQueryString() should work', () => {
    expect(getQueryString).toBeTruthy();
    const state: ClrDatagridStateInterface = {
      filters: [
        {property: 'name', value: 'test'},
        {property: 'url', value: 'http://test.com'},
      ]
    };
    expect(getQueryString(state)).toEqual(encodeURIComponent('name=~test,url=~http://test.com'));
  });

  it('function getSizeNumber() should work', () => {
    expect(getSizeNumber).toBeTruthy();
    expect(getSizeNumber(4564)).toEqual('4.46');
    expect(getSizeNumber(10)).toEqual(10);
    expect(getSizeNumber(456400)).toEqual('445.70');
    expect(getSizeNumber(45640000)).toEqual('43.53');
  });

  it('function getSizeUnit() should work', () => {
    expect(getSizeUnit).toBeTruthy();
    expect(getSizeUnit(4564)).toEqual('KB');
    expect(getSizeUnit(10)).toEqual('Byte');
    expect(getSizeUnit(4564000)).toEqual('MB');
    expect(getSizeUnit(4564000000)).toEqual('GB');
  });
});
