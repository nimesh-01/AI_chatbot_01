const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateRes(prompt) {
    const res = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
    })
    return res.text 
}

module.exports= generateRes