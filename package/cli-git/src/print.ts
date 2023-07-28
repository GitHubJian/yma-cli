import {table} from 'table';

export default function print(
    data: {
        [key: string]: {
            addLines: number;
            deleteLines: number;
            submitLines: number;
        };
    },
    since,
    until,
) {
    const thead = ['id', 'author', 'add lines', 'delete lines', 'submit lines'];
    const tbody: any[] = [];
    Object.keys(data).forEach(function (key) {
        const currentStatistic = data[key];

        tbody.push([key, currentStatistic.addLines, currentStatistic.deleteLines, currentStatistic.submitLines]);
    });

    tbody
        .sort(function (a, b) {
            return b[3] - a[3];
        })
        .forEach(function (item, i) {
            item.unshift(i + 1);
        });

    const tableData = [thead, ...tbody];
    const res = table(tableData, {
        header: {
            content: `Statistic Submit Lines (${since} ~ ${until})`,
            alignment: 'center',
        },
    });

    console.log(res);
}
