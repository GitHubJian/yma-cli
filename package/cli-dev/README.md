##

### Http 方案

```js
module.exports = {
    'GET /api/xxx': {
        code: 0,
        message: 'success',
        data: {},
    },

    'POST /api/update': (req, res) => {
        res.send({
            code: 200,
            message: 'success',
        });
    },
};
```

### Vite 方案

```js
module.exports = [
    {
        url: '/api/xxx',
        method: 'get', // default get
        response: (req, res) => {
            return {
                code: 0,
                message: '',
                data: {},
            };
        },
    },
];
```
