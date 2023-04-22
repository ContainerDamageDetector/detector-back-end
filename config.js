module.exports = {
    ACCESS_TOKEN_SECRET: 'c8566029296b413ebeddfb515b918e2c',
    ACCESS_TOKEN_LIFE: 60 * 60 * 24 * 7 ,
    REFRESH_TOKEN_SECRET: '3bb9071e359e41dd90637a28d93fade6',
    REFRESH_TOKEN_LIFE: 60 * 60 * 24 * 90,
    awsConfig: {
        key: "AKIA5OSYVVF3F5WPQHEY",
        secret: "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",
        region: "ap-south-1",
        bucket: "container-damage-detector"
    },
    damage_predictionServerUrl: "http://127.0.0.1:5000/predictDamageType",
    severity_predictionServerUrl: "http://127.0.0.1:5000/predictSevereType",
    estimateRecoverPrice_predictionServerUrl: "http://127.0.0.1:5000/estimateRecoverPrice"
}