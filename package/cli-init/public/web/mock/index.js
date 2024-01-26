module.exports = {
    'POST /api/online/GetSecretKey': {
        code: '0', // 错误代码 0 正常，其它为错误信息
        msg: '', // 错误信息
        data: {
            identitykey: '', // 用于签名加密
            publickey: '', // 公钥加密
        },
    },
};
