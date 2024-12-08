import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Dimensions, ActivityIndicator, Platform, ImageBackground } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons'; 
import Fontisto from '@expo/vector-icons/Fontisto';
import Constants from 'expo-constants';

const {width: SCREEN_WIDTH} = Dimensions.get("window");
const API_KEY = Constants.expoConfig.extra.WEATHER_API_KEY;

export default function App() {
 const [city, setCity] = useState("Loading...");
 const [days, setDays] = useState([]);
 const [ok, setOk] = useState(true);
 const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"]; 

 const formatDate = (date) => {
   const newDate = new Date(date);
   const year = newDate.getFullYear();
   const month = String(newDate.getMonth() + 1).padStart(2, '0');
   const day = String(newDate.getDate()).padStart(2, '0');
   const dayOfWeek = DAYS_OF_WEEK[newDate.getDay()];
   return `${year}.${month}.${day}(${dayOfWeek})`;
 };

 const weatherDescKo = {
   "clear sky": "맑은 하늘",
   "few clouds": "구름 조금",
   "scattered clouds": "구름 낌",
   "broken clouds": "구름 많음",
   "overcast clouds": "흐림",
   "light rain": "약한 비",
   "moderate rain": "비",
   "heavy rain": "강한 비",
   "light snow": "약한 눈",
   "snow": "눈",
   "heavy snow": "강한 눈",
   "thunderstorm": "천둥번개",
   "mist": "옅은 안개",
   "fog": "안개"
 };

 const icons = {
   "clear sky": "day-sunny",
   "few clouds": "day-cloudy",
   "scattered clouds": "cloudy",
   "broken clouds": "cloudy",
   "overcast clouds": "cloudy",
   "light rain": "rain",
   "moderate rain": "rain",
   "heavy rain": "rains",
   "light snow": "snow",
   "snow": "snow",
   "heavy snow": "snows",
   "thunderstorm": "lightnings",
   "mist": "fog",
   "fog": "fog"
 };

 const getWeatherMessage = (description) => {
   if (["heavy snow", "snow", "light snow"].includes(description)) {
     return "눈온다 !! 눈길 조심 따뜻하게 입자!!⛄❄️";
   } else if (["moderate rain", "light rain", "heavy rain"].includes(description)) {
     return "비온다 !! 우산챙겨 미경아!!☂️";
   } else if (["clear sky", "few clouds"].includes(description)) {
     return "미경아 날씨 좋은데 어디 놀러가지않을래?✈️";
   } else if (["fog", "mist"].includes(description)) {
     return "안개꼈어 앞에 잘보고댕겨 여봉이.🌫️";
   } else if (["overcast clouds", "broken clouds", "scattered clouds"].includes(description)) {
     return "자기야 오늘 흐리다 집에서 방콕이나 하자!!🛌💤";
   } else if (description === "thunderstorm") {
     return "오우야 천둥번개친다 심야괴담회 준비햇!!📺🍿";
   }
   return null;
 };

 const getBackgroundImage = (description) => {
   if (["clear sky", "few clouds"].includes(description)) {
     return require('./assets/sunny-bg.jpg');
   } else if (["moderate rain", "light rain", "heavy rain"].includes(description)) {
     return require('./assets/rain-bg.jpg');
   } else if (["heavy snow", "snow", "light snow"].includes(description)) {
     return require('./assets/snow-bg.jpg');
   } else if (["fog", "mist"].includes(description)) {
     return require('./assets/foggy-bg.jpg');
   } else if (["overcast clouds", "broken clouds", "scattered clouds"].includes(description)) {
     return require('./assets/cloudy-bg.jpg');
   } else if (description === "thunderstorm") {
     return require('./assets/thunder-bg.jpg');
   } else {
     return require('./assets/default-bg.jpg');
   }
 };

 const getAsk = async () => {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if(!granted) {
      setOk(false);
    }
    
    const {coords: {latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy:5});
    const location = await Location.reverseGeocodeAsync(
      {latitude, longitude},
      {userGoogleMaps: false}
    );

    setCity(location[0].region +" "+ location[0].city +" "+ location[0].street);
    
    // 현재 날씨 데이터 가져오기
    const currentWeather = await (
      await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      )
    ).json();
    console.log('현재날씨 데이터 : ',currentWeather);
    console.log("날씨 데이터 시간:", new Date(currentWeather.dt * 1000).toLocaleString('ko-KR'));
    console.log("현재 시간:", new Date().toLocaleString('ko-KR'));
    
    // 예보 데이터 가져오기
    const { list } = await (
      await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      )
    ).json();
    console.log('예보 데이터 : ',list);
    
    // 현재 날짜 
    const today = new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
  }).replace(/\. /g, '-').replace('.', '');


    // KST (한국 표준시) 기준으로 12:00 데이터 필터링
    const filteredList = list.filter(({ dt_txt }) => {
      const date = new Date(dt_txt);
      const kstHour = new Date(date.getTime() + (9 * 60 * 60 * 1000)).getHours();
      // 날짜가 오늘이 아닌 경우에만 포함
      const itemDate = dt_txt.split(' ')[0];
      return kstHour === 12 && itemDate !== today;
    });
    
    // 현재 날씨 데이터 포맷팅
    const currentWeatherFormatted = {
      dt_txt: new Date().toISOString().split("T")[0] + " 00:00:00",
      main: currentWeather.main,
      weather: currentWeather.weather,
      rain: currentWeather.rain,
      snow: currentWeather.snow
    };
    
    const allWeather = [currentWeatherFormatted, ...filteredList];
      console.log('합친 데이터 : ',allWeather);
      setDays(allWeather);
  } catch(err) {
    console.log(err);
  }
};

 useEffect(() => {
   getAsk();
 }, []);

 return (
   <ImageBackground 
     source={days[0] ? getBackgroundImage(days[0].weather[0].description) : require('./assets/default-bg.jpg')}
     style={[styles.container, {opacity: 0.9}]}
     resizeMode="cover"
   >
    <StatusBar style="auto" />
     <View style={styles.overlay}>
       <View style={styles.city}>
         <Text style={styles.cityname}>{city}</Text>
       </View>
       <ScrollView 
         horizontal
         showsHorizontalScrollIndicator={false}
         pagingEnabled 
         contentContainerStyles={styles.weather}
       >
         {days.length === 0 ? (
           <View style={{...styles.day, alignItems:"center", marginTop:"50", }}>
            
             <ActivityIndicator color="white" size="large"/>
           </View>
         ) : (
           days.map((day, index) => 
             <View style={styles.day} key={index}>
              
               <View style={{backgroundColor:"rgba(255, 255, 255, 0.7)", borderRadius: 20}}>
                 <View style={{alignItems: 'center'}}>
                   <Text style={{...styles.dt, fontWeight: "600",}}>{index === 0 ? formatDate(new Date().toISOString()) : formatDate(day.dt_txt)}</Text>
                 </View>
                 <View style={{marginTop: 50}}>
                   <View 
                     style={{
                       flexDirection: "row",
                       alignItems: "center",
                       width: "95%",
                       justifyContent: "space-between",
                     }}
                   >
                     <Text style={styles.temp}>{parseFloat(day.main.temp).toFixed(1)}°C</Text>
                     <Fontisto name={icons[day.weather[0].description]} size={68} color="black" marginRight="10" marginTop="100" />
                   </View>
                   <Text style={styles.description}>{weatherDescKo[day.weather[0].description]}</Text>
                   
                   {day.pop !== undefined && (
                     <Text style={styles.dayPop}>강수확률: {(day.pop * 100).toFixed(0)}%</Text>
                   )}
                   {index === 0 && day.rain && (
                     <Text style={styles.dayPop}>강수량: {day.rain["1h"]}mm/h</Text>
                   )}
                   {index === 0 && day.snow && (
                     <Text style={styles.dayPop}>적설량: {day.snow["1h"]}mm/h</Text>
                   )}
                   <View style={{backgroundColor:"rgba(135, 206, 235, 0.8)", marginTop:"60", borderBottomLeftRadius: 20, borderBottomRightRadius: 20}}>
                     {getWeatherMessage(day.weather[0].description) && (
                       <Text style={styles.snowAndRainText}>
                         {getWeatherMessage(day.weather[0].description)}
                       </Text>
                     )}
                   </View>
                 </View>
               </View>
             </View>
           )
         )}
       </ScrollView>
       <View style={{flex: 0.5, alignItems:'center'}}>
         <Text style={{...styles.MiKyungAppText, backgroundColor:"rgba(255, 255, 255, 0.7)", borderRadius: 20}}>"MiKyung Weather App"</Text>
       </View>
     </View>
   </ImageBackground>
 );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
 },
 overlay: {
   flex: 1,
   backgroundColor: 'rgba(0,0,0,0.2)',
 },
 city: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 cityname: {
   color: 'black',
   fontSize: 28,
   fontWeight: "600",
   marginTop: 50,
   backgroundColor:"#87CEEB",
   borderRadius: 20,
    padding: 10,
 },
 weather: {
 },
 day: {
   width: SCREEN_WIDTH,
   alignItems: "flex-start",
   paddingHorizontal: 20,
 },
 temp: {
   marginTop: 50,
   fontWeight: "600",
   fontSize: 80,
   color: 'black',
 },
 description: {
   marginTop: 30,
   marginLeft: 30,
   fontWeight: "600",
   fontSize: 30,
   color: 'black',
 },
 dt: {
   marginTop: 30,
   fontSize: 30,
   color: 'black',
 },
 dayPop: {
   marginTop: 10,
   marginLeft: 30,
   fontWeight: "600",
   fontSize: 20,
   color: 'black',
 },
 MiKyungAppText: {
   marginTop: 30,
   padding: 10,
   width: "80%",
   textAlign: 'center',
   color: 'black',
   fontWeight: "600",
   fontSize: 20,
 },
 snowAndRainText: {
   padding: 10,
   textAlign: 'center',
   color: 'black',
   fontWeight: "600",
   fontSize: 15,
 }
});