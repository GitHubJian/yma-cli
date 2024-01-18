module.exports = {
    'POST /api/online/GetSecretKey': {
        code: '0', // 错误代码 0 正常，其它为错误信息
        msg: '', // 错误信息
        data: {
            identitykey: 'f2d6dfasd9e9089a1aca523f3187', // 用于签名加密
            publickey:
                'MIIBCgKCAQEApo1SuInr8/2e77drMkvP9BO6rPhsmsds2LZ8wX+w2YzzcHa7R9TJFQon1tALFZJNXTmDsBk7Ga34enbfufOBK1WlIvpUgIc3dED//PL/QjuBnsoDb8giBFDYvAG+S6UdA2P8C9zYQ89rDuJ0y2Ti1u4Thu3Rn8Vs8+LIMTGY8/VCxKtxlY+2PEfDkkFfJXhbAxX5hE1vE/T355gZtn931LLLC5lnkZx5KoxQmYNyKWAv+e5ltvKxtFp7Pl9cBUL4krz24+37ZpD5ew4StApFW+hV6qU/E8lf2iG/MkyiGivFedWUa55NR/ZVODNXQUqjsLybXsVsMqZFmrbtqG0Q6wIDAQAB', // 非对称加密，用于手机号和密码加密
        },
    },
};
