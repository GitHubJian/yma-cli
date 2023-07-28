import {warn} from 'yma-shared-util';
import print from './print';
import * as statistic from './statistic';

export default function (repos, since, until, authors) {
    warn('Statistic...', 'YMA Git');

    const data = statistic.statistic(repos, since, until, authors);

    print(data.authors, since, until);
}
