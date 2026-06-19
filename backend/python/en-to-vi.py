import json
from googletrans import Translator

# Đọc file intents
with open("intents_to_translate_vi.json", "r", encoding="utf-8") as f:
    data = json.load(f)

translator = Translator()

def translate_text(text):
    # Loại bỏ [VIET] và dịch nếu có
    if "[VIET]" in text:
        text_to_translate = text.replace("[VIET]", "").strip()
        # Nếu text rỗng thì bỏ qua
        if not text_to_translate:
            return ""
        # Dịch sang tiếng Việt
        translated = translator.translate(text_to_translate, src="en", dest="vi").text
        return translated
    return text

for intent in data["intents"]:
    # Dịch patterns
    new_patterns = []
    for pattern in intent.get("patterns", []):
        if "[VIET]" in pattern:
            new_patterns.append(translate_text(pattern))
        else:
            new_patterns.append(pattern)
    intent["patterns"] = new_patterns

    # Dịch responses
    new_responses = []
    for resp in intent.get("responses", []):
        if "[VIET]" in resp:
            new_responses.append(translate_text(resp))
        else:
            new_responses.append(resp)
    intent["responses"] = new_responses

# Ghi ra file mới
with open("intents_vi.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Đã dịch xong, file mới: intents_vi.json")