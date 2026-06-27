import express from "express"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"
dotenv.config({ path: "../.env" })

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.post("/chat", async(req, res) => {
    const { input } = req.body || {}
    if(!input){
        return res.status(400).json({message: "Input is required"})
    }

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: input,
    })

    return res.json({message: response.text})
})  

// const main = async() => {
//     const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: "hello, what is 2+2. then 0/0",
//     })
//     console.log(response.text)
// }
// main()

app.get("/", (req, res) => {
    return res.json({message: "Hello from Level 4!"})
})

app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
})
