module.exports = {
    devServer: {
        proxy: {
            "/api/*": {
                target: "http://backend:8080",
                secure: false
            },
            "/autologin": {
                target: "http://backend:8080",
                secure: false
            }
        }
    }
};