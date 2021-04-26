import { defined } from './defined';
import { DeveloperError } from './DeveloperError';
import { oneTimeWarning } from './oneTimeWarning';

function deprecationWarning(identifier: string, message: string) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(identifier) || !defined(message)) {
        throw new DeveloperError('identifier and message are required.');
    }
    //>>includeEnd('debug');

    oneTimeWarning(identifier, message);
}

export { deprecationWarning };
