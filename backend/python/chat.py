import random
import json
import torch
from torch import topk
from transformers import BertForSequenceClassification, BertTokenizerFast, pipeline
from sentence_transformers import SentenceTransformer, util

# Load intents từ file
def LoadJsonFile(fileName):
    with open(fileName, "r", encoding="utf-8") as f:
        file = json.load(f)
    return file

# Tìm response dựa trên tag
def GetResponseFromTag(predictedTag, intents):
    for intent in intents["intents"]:
        if intent["tag"] == predictedTag:
            return random.choice(intent["responses"])
    return "Sorry, I couldn't understand that."

# Chuẩn bị embedding từ SBERT
def PrepareSbertEmbeddings(intents, model_sbert):
    allTexts = []
    intentTags = []
    for intent in intents["intents"]:
        for pattern in intent["patterns"]:
            allTexts.append(pattern)
            intentTags.append(intent["tag"])
    embeddings = model_sbert.encode(allTexts, convert_to_tensor=True)
    return embeddings, intentTags, allTexts

#Lưu hội thoại
def SaveConversationToFile(user_input, bot_response, filename="Conversation.json"):
    data = {"user": user_input, "bot": bot_response}

    try:
        with open(filename, "r", encoding="utf-8") as f:   # SỬA encoding
            history = json.load(f)
    except FileNotFoundError:
        history = []

    history.append(data)

    with open(filename, "w", encoding="utf-8") as f:   # SỬA encoding
        json.dump(history, f, ensure_ascii=False, indent=2)

# Lấy câu hỏi trước đó
def GetLastConversation(filename="Conversation.json"):
    try:
        with open(filename, "r", encoding="utf-8") as f:   # SỬA encoding
            history = json.load(f)
        if history:
            last_convo = history[-1]
            return last_convo["user"], last_convo["bot"]
        else:
            return None, None
    except FileNotFoundError:
        return None, None
def chat_once(text, chatbot, sbert_model, embeddings, intent_tags, all_patterns, intents, id2label):
    text = text.strip().lower()
    # Dự đoán bằng BERT
    bertOutput = chatbot(text)[0]
    score = bertOutput["score"]
    label = bertOutput["label"]  # Ex: "greeting" hoặc "LABEL_0"
    predictedTag = label if label in id2label.values() else None

    if score >= 0.8 and predictedTag:
        if predictedTag == "repeat":
            user_input, bot_response = GetLastConversation()
            response = GetResponseFromTag(predictedTag, intents)
            if user_input and bot_response:
                return f"{response} {bot_response}"
            else:
                return "Tôi chưa có hội thoại nào trước đó để nhắc lại."
        else:
            response = GetResponseFromTag(predictedTag, intents)
            SaveConversationToFile(text, response)
            return response
    else:
        # Nếu BERT không chắc → fallback sang SBERT
        userEmbedding = sbert_model.encode(text, convert_to_tensor=True)
        cosineScores = util.pytorch_cos_sim(userEmbedding, embeddings)[0]
        top_k = 3
        topResults = torch.topk(cosineScores, k=top_k)
        bestScore = topResults.values[0].item()
        if bestScore > 0.6:
            bestTag = intent_tags[topResults.indices[0].item()]
            response = GetResponseFromTag(bestTag, intents)
            SaveConversationToFile(text, response)
            return response
        else:
            suggestions = [all_patterns[idx] for idx in topResults.indices]
            suggest_text = "Mình chưa hiểu câu này. Bạn có định hỏi một trong các ý sau không?\n"
            for i, sug in enumerate(suggestions):
                suggest_text += f"{i+1}. {sug}\n"
            suggest_text += "Nếu đúng, bạn hãy thử gõ lại hoặc diễn đạt khác nhé."
            return suggest_text