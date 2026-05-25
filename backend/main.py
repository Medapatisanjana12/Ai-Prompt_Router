from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from groq import Groq
from dotenv import load_dotenv

from prompts import PROMPTS

import os
import json

# -----------------------------
# Load Environment Variables
# -----------------------------

load_dotenv()

# -----------------------------
# FastAPI App
# -----------------------------

app = FastAPI()

# -----------------------------
# Enable CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Groq Client
# -----------------------------

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# -----------------------------
# Request Schema
# -----------------------------

class MessageRequest(BaseModel):
    message: str

# -----------------------------
# Intent Classifier
# -----------------------------

def classify_intent(message: str):

    prompt = f"""
You are an intent classifier.

Choose ONLY one label from:
code, data, writing, career, unclear

Return ONLY valid JSON.

Example:
{{"intent":"code","confidence":0.95}}

User message:
{message}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    text = response.choices[0].message.content

    try:
        return json.loads(text)

    except:
        return {
            "intent": "unclear",
            "confidence": 0.0
        }

# -----------------------------
# Response Router
# -----------------------------

def route_and_respond(message, intent_data):

    intent = intent_data["intent"]

    if intent == "unclear":
        return (
            "Could you clarify your request? "
            "Are you asking about coding, writing, data analysis, or career advice?"
        )

    system_prompt = PROMPTS[intent]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": message
            }
        ]
    )

    return response.choices[0].message.content

# -----------------------------
# Logging
# -----------------------------

def log_route(intent_data, message, final_response):

    log_entry = {
        "intent": intent_data["intent"],
        "confidence": intent_data["confidence"],
        "user_message": message,
        "final_response": final_response
    }

    with open("route_log.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

# -----------------------------
# API Route
# -----------------------------
@app.get("/")
def home():
    return {
        "message": "AI Prompt Router API is running 🚀"
    }
@app.post("/chat")
def chat(req: MessageRequest):

    intent_data = classify_intent(req.message)

    final_response = route_and_respond(
        req.message,
        intent_data
    )

    log_route(intent_data, req.message, final_response)

    return {
        "intent": intent_data["intent"],
        "confidence": intent_data["confidence"],
        "response": final_response
    }