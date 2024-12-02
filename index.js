import userModel from "./src/models/User.js";
import connectDb from "./src/config/db.js";
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import axios from "axios";
//const { Telegraf } = require('telegraf')
//const { message } = require('telegraf/filters')
const { TOKEN, SERVER_URL } = process.env
//const axios = require('axios');
const bot = new Telegraf(TOKEN)
const apiKey = process.env.CITY_API_KEY;


try {
    connectDb()
    console.log('Database connected')
} catch (error) {
    console.log(error)
}

function generateWeatherResponse(city,temperature, feelsLike, humidity, windSpeed, weatherCondition,weatherdesc, icon) {
    // Map weather conditions to emojis
    const weatherEmojis = {
      "Clear": "☀️",
      "Clouds": "☁️",
      "Rain": "🌧️",
      "Drizzle": "🌦️",
      "Thunderstorm": "⛈️",
      "Snow": "❄️",
      "Mist": "🌫️",
      // Add more conditions and emojis as needed
    };
  
    // Generate the response message
    const responseMessage = `**${city} Weather** 🏙️
  
     Current: ${temperature.toFixed(1)}°C ${weatherEmojis[weatherCondition]}
     Feels Like: ${feelsLike.toFixed(1)}°C 🌡️
     Humidity: ${humidity}% 💧
     Wind: ${windSpeed} km/h 💨 
     weather: ${weatherdesc} ${icon}
  
  **Enjoy your day!** 
  
  `;
  
    return responseMessage;
  }
  

  
  //const response = generateWeatherResponse(city, temperature, feelsLike, humidity, windSpeed, weatherCondition);
  //console.log(response);


const fetchData = async (city) => {
    try {
      const apiUrl = `https://api.api-ninjas.com/v1/city?name=${city}`;
      const response = await axios.get(apiUrl, {headers:{'X-Api-Key': apiKey}}); // Make a GET request
      //console.log('Response:', response.data); // Log the response data
      const data = response.data;
      const latitude = data[0].latitude;
      const longitude = data[0].longitude;
      

      //console.log('City Name:', cityName);
      //console.log('Country:', cityCountry);
      return {latitude, longitude}

      
    } catch (error) {
      console.error('Error fetching dat:', error.message);
    }
  };
  


bot.start(async (ctx) => {
    console.log(ctx)
    const from = ctx.update.message.from
    const user_name = ctx.update.message.from.first_name
    
    try {
        await userModel.findOneAndUpdate(
            {
                tgId: from.id
            },
            {
                $setOnInsert: {
                    firstName: from.first_name,
                    lastName: from.last_name,
                    username: from.username,
                    isbot: from.is_bot
                }
            },
            {
                upsert: true,new: true
            }
        );
    } catch (error) {
        
    }

    try {
        await ctx.reply(`Hi ${user_name}! 👋

            I'm your friendly weather bot, ready to keep you updated on the latest forecast. 🌤️🌦️⛈️
            
            Just send me a city name, and I'll provide you with the weather details. 
            
            Let's get started! 🚀`);
    } catch (error) {
        console.log(error)
        ctx.reply("Something went wrong. Please try again later.")
    }
});

bot.on(message('text'), async (ctx) => {
    const text = ctx.message.text
    if ( text.includes('/weather')) {
        const message = ctx.message.text
        const message_text = message.substring(9)
        //console.log(message_text)
        
        try {
            const weather_apiKey = process.env.weather_apiKey
            const {latitude, longitude} = await fetchData(message_text)
            //console.log(latitude, longitude)
            const weather_res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weather_apiKey}`)
            const weather_report = weather_res.data
            //console.log(weather_report)
            const weatherCondition = weather_report.list[0].weather[0].main;
            const weatherdesc = weather_report.list[0].weather[0].description
            const iconid = weather_report.list[0].weather[0].icon
            const icon = `https://openweathermap.org/img/wn/${iconid}@2x.png`
            const temperature = weather_report.list[0].main.temp - 273.15;
            const city = weather_report.city.name;
            const humidity = weather_report.list[0].main.humidity;
            // const pressure = weather_report.list[0].main.pressure;
            const feelsLike = weather_report.list[0].main.feels_like - 273.15
            const windSpeed = weather_report.list[0].wind.speed;
            //console.log(temperature,feelsLike)
            const repply_message = generateWeatherResponse(city, temperature, feelsLike, humidity, windSpeed, weatherCondition,weatherdesc,icon);
            //console.log(repply_message)
            await ctx.reply(repply_message)
            //console.log(repply_message);

        } catch (error) {
            console.log(error)
            await ctx.reply('/weather [city_name] - Get real-time weather conditions for a specific city.');
        }

       
        //console.log(cityName, cityCountry)

        
      } else if (text.includes('/forecast')) {

        const message = ctx.message.text
        const message_text = message.substring(9)
        console.log(message_text)
        
        try {
            await ctx.reply(`Hey there! 🛠️

We're currently working hard to bring you an accurate and detailed forecast feature. Stay tuned for updates!

In the meantime, you can still get real-time weather information for your city.

Thanks for your patience! 🙏`);
            
        } catch (error) {
            await ctx.reply('/forecast [city_name] - Get a 5-day weather forecast for a specific city.');
        }
   } else if (text.includes('/subscribe')) {
    const message_s = ctx.message.text
    const subscribe_message_text = message.substring(9)

    

   } else {
            await ctx.reply(`Hi there! 👋 I'm your friendly weather bot. 🌤️🌧️

Here's what I can do:

/weather [city_name] - Get real-time weather.
/forecast [city_name] - Get a 5-day forecast.`);
         
   }
    
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))