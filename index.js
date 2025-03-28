const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Corrected package name
const fs = require("fs");

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Replace with your actual Gemini API key (store it securely in environment variables)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY);

// API endpoint to generate the image
app.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;

  // Use the provided prompt or default to the original one
  const contents =
    prompt ||
    "Hi, can you create a 3d rendered image of a pig with wings and a top hat flying over a happy futuristic scifi city with lots of greenery?";

  try {
    const response = await ai.generateContent({
      model: "gemini-1.5-flash", // Use a valid model (check Gemini API docs for the correct model)
      prompt: contents,
      responseMimeType: "image/png", // Specify the desired output format
    });

    // Extract the image data
    const imageData = response.data; // Adjust based on actual response structure
    if (!imageData) {
      return res.status(500).json({ error: "No image data returned from Gemini API" });
    }

    // Save the image
    const buffer = Buffer.from(imageData, "base64");
    const imagePath = "gemini-native-image.png";
    fs.writeFileSync(imagePath, buffer);

    // Send the image path or base64 data back to the front end
    res.json({
      message: "Image generated successfully",
      imagePath: imagePath,
      imageBase64: imageData, // Optionally send the base64 data
    });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Failed to generate image", details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
