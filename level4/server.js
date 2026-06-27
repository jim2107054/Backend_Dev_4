import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config({ path: "../.env" });
import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import * as z from "zod";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const getWeather = tool((input) => `It's always sunny in ${input.city}!`, {
  name: "get_weather",
  description: "Get the weather for a given city",
  schema: z.object({
    city: z.string().describe("The city to get the weather for"),
  }),
});

//! LangChain with Groq
const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
  maxTokens: undefined,
  maxRetries: 2,
});

app.post("/chat", async (req, res) => {
  try {
    const { input } = req.body || {};
    if (!input) {
      return res.status(400).json({ message: "Input is required!" });
    }
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant that translates English to French. Translate the user sentence.",
      },
      {
        role: "user",
        content: input,
      },
    ];

    const response = await llm.invoke(messages);
    // console.log(response);
    // console.log(response.content);
    return res.status(200).json({ success: true, response: response.content });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error!" });
  }
});

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY,
// });

//! LangChain - one approach
// app.post("/chat", async(req, res)=> {
//     const {input} = req.body || {}

//     if(!input){
//         return res.status(400).json({message: "Input is required"})
//     }

//     try {
//         const agent = createAgent({
//       model: "google-genai:gemini-2.5-flash-lite",
//       tools: [getWeather],
//     });

//         const userContent = typeof input === "string" ? input : JSON.stringify(input);
//         const messages = [
//             {
//                 role: "system",
//                 content: "You are a helpful assistant that translates English to French. Translate the user sentence.",
//             },
//             {
//                 role: "user",
//                 content: userContent,
//             },
//         ];

//         const result = await agent.invoke({ messages });

//         console.log("Agent Result:", result);
//         const lastMessage = result.messages?.[result.messages.length - 1];
//         const outputMessage = typeof lastMessage?.content === "string"
//             ? lastMessage.content
//             : lastMessage?.content?.[0]?.text || "No response generated";

//         console.log("Output Message:", outputMessage);

//         return res.json({ message: outputMessage });
//     } catch (error) {
//         return res.status(500).json({message: "Internal Server Error", error: error.message})
//     }
// })

//! LangChain -> 2nd approach
// app.post("/chat", async(req, res)=> {
//     try {
//         const {input} = req.body || {}
//         if(!input){
//             return res.status(400).json({message: "Input is required"})
//         }

//         const model = new ChatGoogleGenerativeAI({
//             model: "gemini-2.5-flash",
//             temperature: 1.0,
//             maxRetries: 2,
//         });

//         // This is know as prompt templating. We use this template to guide the model's behaviour.
//         const messages = [
//             [
//                 "system",
//                 "You are a helpful assistant that translates English to French. Translate the user sentence.then in bangla",
//             ],
//             ["human", input],
//         ];

//         const ai_msg = await model.invoke(messages);
//         console.log(ai_msg);
//         return res.json({ message: ai_msg.content });

//     } catch (error) {
//         return res.status(500).json({message: "Internal server error", error: error.message})
//     }
// })

//! Without langChain
// app.post("/chat", async(req, res) => {
//     const { input } = req.body || {}
//     if(!input){
//         return res.status(400).json({message: "Input is required"})
//     }

//     try {
//         const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         // contents: input,
//         contents: [
//             {
//                 role: "system",
//                 parts: [{
//                     text: "You are a math expert who answers in a concise and direct manner. and your name is Siraj sir. If you can't solve, say that it is beyond your ability."
//                 }],
//             },
//             {
//                 role: "user",
//                 parts: [
//                     {
//                         text: input
//                     }
//                 ]
//             }
//         ]
//     })
//     if (response && response.text) {
//         return res.json({message: response.text})
//     }
//     } catch (error) {
//         return res.status(500).json({message: "Internal Server Error", error: error.message})
//     }
// })

// const main = async() => {
//     const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: "hello, what is 2+2. then 0/0",
//     })
//     console.log(response.text)
// }
// main()

app.get("/", (req, res) => {
  return res.json({ message: "Hello from Level 4!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
