##

### Mock Data

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
