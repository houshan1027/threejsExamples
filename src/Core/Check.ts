import { defined } from './defined';
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

/**
 * Throws if test is not defined
 *
 * @param {String} name The name of the variable being tested
 * @param {*} test The value that is to be checked
 * @exception {DeveloperError} test must be defined
 */
Check.defined = function(name: any, test: any) {
    if (!defined(test)) {
        throw new DeveloperError(getUndefinedErrorMessage(name));
    }
};

export { Check };
