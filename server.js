const express = require("express");
const { createChat } = require("completions");
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = 8080;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const Key = process.env.WEATHER_API

const chat = createChat({
    apiKey: process.env.API_KEY,
    model: "gpt-3.5-turbo-0613",
    functions: [
      {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
        function: async ({ location }) => {
          let res_single = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${Key}&units=metric&sys=unix`);
              let data= await res_single.json();
            return {
              location: data.name, //weather api
              temperature: data.main.temp,  //weather api
              humidity: data.main.humidity,
              unit: "celsius",
              type:data.weather[0].main,
              description: data.weather[0].description,
              explain: "Explain all these parameters in a news forecast way",
              information:data
            };
        },
      },
    ],
    functionCall: "auto",
  });


app.post("/bot", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await chat.sendMessage(message);

    return res.send({ message: response.content, success: true });
  } catch (error) {
    const errorMessage =
      "It seems that the answer to this question isn't available. Could you please try rephrasing the question or check if there might be an issue with it? I'm looking forword to assist you!";
    return res.send({ message: errorMessage, success: false });
  }
});


app.listen(port, ()=>{
    try{
        console.log("Listening on port no 8080")
    }catch(error){
        console.log(error)
    }
})


