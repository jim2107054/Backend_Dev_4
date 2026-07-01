import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config({ path: "../.env" });
import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import * as z from "zod";
import { StateSchema, MessagesValue, StateGraph, START, END, Annotation } from "@langchain/langgraph";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//create the state
// const State = new StateSchema({
//   messages: MessagesValue
// })

// const mock_llm: GraphNode<typeof State> = (state) => {
//   return { messages: [{ role: "ai", content: "hello world" }] };
// };
// const graph = new StateGraph(State).addNode("mock_llm", mock_llm).addEdge(START, "mock_llm").addEdge("mock_llm", END).compile();

// await graph.invoke({
//   messages: [{
//     role: "user",
//     content: "Hi"
//   }]
// })

//! LangGraph using custom "State"
const State = Annotation.Root({
      prompt: Annotation,
      aiMessage: Annotation 
    })

    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "openai/gpt-oss-120b", // Groq typically uses specific model strings like llama3-8b-8192 or mixtral-8x7b-32768
    });

    const callLLM = async(state) => {
    const response = await llm.invoke([
    {
      role: "system",
      content: "you are a assistant and your name is jarvis. You are a language translator, you translate any language into Bangla language. if you don't know the answer then don't give incorrect answer"
    },
    {
      role: "human",
      content: state.prompt
    }
  ])
    return {
      aiMessage: response.content,
    };
  }

    const graph = new StateGraph(State)
    .addNode("agent", callLLM)
    .addEdge("__start__", "agent")
    .addEdge("agent", "__end__")
    .compile();


app.post("/chat", async (req, res) => {
  try {
    const { input } = req.body;

    if(!input){
      return res.status(400).json({ message: "Input is required" });
    }

    const result = await graph.invoke({
      prompt: input,
    });

    console.log("result", result.aiMessage);
    res.json({ result: result});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
})

app.get("/", (req, res) => {
  return res.json({ message: "Hello from Level 4!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
