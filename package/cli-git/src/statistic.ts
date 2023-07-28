import execa from 'execa';
import * as git from './git';

function isNumber(v): boolean {
    return typeof v === 'number';
}

function sum(arr: number[]): number {
    return arr.reduce((prev, cur) => prev + cur, 0);
}

export function baseStatistic(
    repo,
    since,
    until,
    author,
): {
    addLines: number;
    deleteLines: number;
    submitLines: number;
} {
    const args = [
        'log',
        '--oneline',
        '--shortstat',
        '--format=',
        '--no-merges',
        '--numstat',
        `--since=${since}`,
        `--until=${until}`,
    ];

    author && args.push(`--author=${author}`);

    const {stdout} = execa.sync('git', args, {
        cwd: repo,
    });

    const allLines = stdout.trim().split('\n');
    const allStatistic = allLines
        .filter(function (v) {
            return !v.startsWith(' ');
        })
        .map(function (line) {
            const [addLine, deleteLine, filepath] = line.split(/\s+/);

            const res = {
                addLine: isNumber(+addLine) && !isNaN(+addLine) ? +addLine : 0,
                deleteLine: isNumber(+deleteLine) && !isNaN(+deleteLine) ? +deleteLine : 0,
                filepath,
            };

            return res;
        });

    const addLines = sum(allStatistic.map(v => v.addLine));
    const deleteLines = sum(allStatistic.map(v => v.deleteLine));
    const submitLines = addLines + deleteLines;

    const ret = {
        addLines,
        deleteLines,
        submitLines,
    };

    return ret;
}

export function statisticRepo(repo, since, until, author) {
    const branchNames = git.getBranchName(repo);

    const statistic: Array<{
        addLines: number;
        deleteLines: number;
        submitLines: number;
        branchName: string;
    }> = [];

    for (let i = 0; i < branchNames.length; i++) {
        const currentOriginBranchName = branchNames[i];

        const currentLocalBranchName = git.checkout(currentOriginBranchName, repo);

        git.pull(repo);

        const branchStatistic = baseStatistic(repo, since, until, author);

        statistic.push({
            ...branchStatistic,
            branchName: currentLocalBranchName,
        });
    }

    return statistic;
}

export function statistic(repos: string[], since: string, until: string, authors: string[]) {
    const statisticsRepos = {};
    const statisticAuthors = {};

    for (let j = 0; j < repos.length; j++) {
        const currentRepo = repos[j];
        if (authors.length === 0) {
        } else {
            for (let i = 0; i < authors.length; i++) {
                const currentAuthor = authors[i];
                const currentStatistic = statisticRepo(currentRepo, since, until, currentAuthor);

                const res = currentStatistic.reduce(
                    function (prev, cur) {
                        prev.addLines += cur.addLines;
                        prev.deleteLines += cur.deleteLines;
                        prev.submitLines += cur.submitLines;

                        return prev;
                    },
                    {
                        addLines: 0,
                        deleteLines: 0,
                        submitLines: 0,
                    },
                );

                statisticsRepos[currentRepo] = statisticsRepos[currentRepo] || {};
                statisticsRepos[currentRepo][currentAuthor] = res;
            }
        }
    }

    for (let i = 0; i < authors.length; i++) {
        const currentAuthor = authors[i];

        statisticAuthors[currentAuthor] = statisticAuthors[currentAuthor] || {
            addLines: 0,
            deleteLines: 0,
            submitLines: 0,
        };

        for (let j = 0; j < repos.length; j++) {
            const currentRepo = repos[j];
            const currentRepoStatistic = statisticsRepos[currentRepo][currentAuthor];

            let currentAuthorStatistic = statisticAuthors[currentAuthor];

            statisticAuthors[currentAuthor] = {
                addLines: currentRepoStatistic.addLines + currentAuthorStatistic.addLines,
                deleteLines: currentRepoStatistic.deleteLines + currentAuthorStatistic.deleteLines,
                submitLines: currentRepoStatistic.submitLines + currentAuthorStatistic.submitLines,
            };
        }
    }

    const res = {
        repos: statisticsRepos,
        authors: statisticAuthors,
    };

    return res;
}
