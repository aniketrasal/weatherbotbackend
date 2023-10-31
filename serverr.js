const express = require("express");
const { createChat } = require("completions");
const cors = require('cors');
require("dotenv").config({ path: ".env" });

const app = express();
const PORT = process.env.PORT;
const OPENAI_KEY = process.env.API_KEY;
const WEATHER_KEY = process.env.WEATHER_API;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const chat = createChat({
  apiKey: OPENAI_KEY,
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
        let res_single = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_KEY}&units=metric&sys=unix`
        );
        let data = await res_single.json();
        return {
          location: data.name, //weather api
          temperature: data.main.temp, //weather api
          information: data,
          unit: "celsius",
          type: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          explain: "explain all these parameters in a news forcast way",
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
      "It appears that the response to your question is not available at this time. Make an effort to rephrase the question. I'm excited to continue helping you.";
    return res.send({ message: errorMessage, success: false });
  }
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});