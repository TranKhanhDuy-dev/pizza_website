from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# Import các hàm và biến cần thiết từ Chat.py
from chat import (
    chat_once, LoadJsonFile, PrepareSbertEmbeddings, GetResponseFromTag,
    SaveConversationToFile, GetLastConversation
)
from transformers import BertForSequenceClassification, BertTokenizerFast, pipeline
from sentence_transformers import SentenceTransformer

import torch

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load mô hình và dữ liệu (chỉ chạy 1 lần khi khởi động server)
model_path = "ChatBot"
model = BertForSequenceClassification.from_pretrained(model_path)
tokenizer = BertTokenizerFast.from_pretrained(model_path)
chatbot = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)
id2label = model.config.id2label
sbertModel = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
intents = LoadJsonFile("intents.json")
embeddings, intentTags, allPatterns = PrepareSbertEmbeddings(intents, sbertModel)

@app.post("/api/chat")
async def chat(request: Request):
    try:
        data = await request.json()
        user_message = data.get("message", "")
        reply = chat_once(
            user_message, chatbot, sbertModel, embeddings, intentTags, allPatterns, intents, id2label
        )
        print(reply)
        return {"reply": reply}
    except Exception as e:
        print("LỖI CHATBOT:", e)
        return {"reply": "Xin lỗi, hệ thống bận!"}