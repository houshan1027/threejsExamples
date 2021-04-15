import { DeveloperError } from './DeveloperError';

let Check: any = {};

Check.typeOf = {};

function getUndefinedErrorMessage(name: any) {
    return name + ' is required, actual value was undefined';
}

function getFailedTypeErrorMessage(actual: any, expected: any, name: any) {
    return (
        'Expected ' +
        name +
        ' to be typeof ' +
        expected +
        ', actual typeof was ' +
        actual
    );
}

Check.typeOf.func = function(name: any, test: any) {
    if (typeof test !== 'function') {
        throw new DeveloperError(
            getFailedTypeErrorMessage(typeof test, 'function', name)
        );
    }
};

export { Check };
