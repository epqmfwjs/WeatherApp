const env = require('./env');

module.exports = {
  "expo": {
    "name": "mikyung-weather",
    "slug": "mikyung-weather",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.choikwanghyun.mikyungweather"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "70901ba1-08de-4241-85da-7ab4fb912367"
      },
      "WEATHER_API_KEY": env.WEATHER_API_KEY
    }
  }
};