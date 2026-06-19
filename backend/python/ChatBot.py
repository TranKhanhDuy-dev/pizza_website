import json
import numpy as np
import pandas as pd
import keras
import nltk

from nltk.stem import PorterStemmer
from nltk import word_tokenize

from collections import Counter
# from sklearn.tree import DecisionTreeClassifier
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_recall_fscore_support
from sklearn.metrics import accuracy_score
import torch
from torch.utils.data import Dataset

from transformers import BertTokenizer, BertForSequenceClassification
from transformers import TrainingArguments
from transformers import Trainer

class DataLoader(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels
    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item
    def __len__(self):
        return len(self.labels)
# import joblib
#Chuyển các từ về dạng chữ thường(VD: running -> run)
#nltk.download("punkt_tab")
stemmer = PorterStemmer()
ignore_words=["?", "!", ",", "."]

def LoadJsonFile(fileName):
    with open(fileName) as f:
        file = json.load(f)
    return file
def createDF():
    df = pd.DataFrame(columns=["Pattern", "Tag"])
    return df
def ExtractJsonInfo(jsonFile, df):
    for intent in jsonFile["intents"]:
        for pattern in intent["patterns"]:
            sentence_tag = [pattern, intent["tag"]]
            df.loc[len(df.index)] = sentence_tag
    return df
#Chuyển về chữ viết thường
def PreprocessPattern(pattern):
    words = word_tokenize(pattern.lower())
    stemmed_words = [stemmer.stem(word) for word in words if word not in ignore_words]
    return " ".join(stemmed_words)  
#Tách từng chữ ra khỏi câu    
def GetCorpus(series):
    words = []
    for text in series:
        for word in text.split():
            words.append(word.strip())
    return words

#Thông tin của dataframe
def PrintShapeDF(df, name = "df"):
    print(f"{name} dateset has {df.shape[0]} rows and {df.shape[1]} columns")
def NumClasses(df, target_col, ds_name="df"):
    print(f"The {ds_name} dataset has {len(df[target_col].unique())} classes")
def CheckNull(df, ds_name='df'):
    print(f"Null Values in each col in the {ds_name} dataset:\n")
    print(df.isnull().sum())

#Hàm tính toán
def ComputeMetrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average="weighted", zero_division=0)
    acc = accuracy_score(labels, preds)
    return {"accuracy": acc, "f1": f1, "precision": precision, "recall": recall}

#Hàm xử lý
def Predict(text):
    inputs = tokenizer(text, padding=True, truncation=True, max_length= 512, return_tensors="pt").to(device)
    outputs = model(**inputs)

    probs = outputs[0].softmax(1)
    predLabelIdx = probs.argmax()
    predLabel = model.config.id2label[predLabelIdx.item()]

    return probs, predLabelIdx, predLabel
fileName = "intents"
#đọc file json vào pandas(bảng)
resources = LoadJsonFile(fileName)
dfChat = createDF()
dfChat = ExtractJsonInfo(resources, dfChat)
dfChat.head()
dfChat.tail()
dfSupport = dfChat

PrintShapeDF(dfChat, "Chatbot")
NumClasses(dfChat, "Tag", "Chatbot")
CheckNull(dfChat, "Chatbot")

dfChat["Pattern"] = dfChat["Pattern"].apply(PreprocessPattern)
dfChat.head()
corpus = GetCorpus(dfChat["Pattern"])
corpus[:5]
print(f"dataset contains {len(corpus)} words")
#Đếm số lần xuất hiện của các từ
counter = Counter(corpus)
mostCommn = counter.most_common(10)
#Chuyển về dạng dictionary
mostCommn = dict(mostCommn)

#Lấy tag và lọc trùng + bỏ khoảng trắng -> đem vào mảng
labels = dfSupport["Tag"].dropna().unique().tolist()
labels = [s.strip() for s in labels if s.strip()]
numLabels = len(labels)
#id - label
id2Label = {id: label for id, label in enumerate(labels)}
#label - id
label2Id = {label: id for id, label in id2Label.items()}
#Tạo thêm cột labels và gắn id theo tag
dfSupport["Label"] = dfSupport["Tag"].map(lambda x: label2Id[x.strip()])

#Chia thành 2 phần train và test
X = list(dfSupport["Pattern"])
Y = list(dfSupport["Label"])
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=3)

#modelName = "bert-base-uncased"
modelName = "bert-base-multilingual-cased"
maxLength = 256

tokenizer = BertTokenizer.from_pretrained(modelName)
#tokens = tokenizer("Hello world!", max_length=maxLength, truncation=True)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = BertForSequenceClassification.from_pretrained(modelName, num_labels=numLabels, id2label = id2Label, label2id = label2Id).to(device)

#Chuyển data thành số
trainEncodings = tokenizer(X_train, truncation=True, padding=True, max_length=maxLength)
testEncodings = tokenizer(X_test, truncation=True, padding=True, max_length=maxLength)
fullData = tokenizer(X, truncation=True, padding=True, max_length=maxLength)

trainDataLoader = DataLoader(trainEncodings, Y_train)
testDataLoader = DataLoader(testEncodings, Y_test)
fullDataLoader = DataLoader(fullData, Y)

#setup cách huấn luyện mô hình
trainingArgs = TrainingArguments(
    output_dir = "./results",
    do_train = True,
    do_eval = True,
    num_train_epochs = 20,
    per_device_train_batch_size = 16,
    per_device_eval_batch_size = 16,
    warmup_steps = 100,
    weight_decay = 0.05,
    logging_strategy = "steps",
    logging_dir = "multi-class-logs",
    logging_steps = 50,
    eval_strategy = "steps",
    eval_steps = 50,
    save_strategy = "steps",
    load_best_model_at_end = True,
)

#Huấn luyện
#ComputerMetrics chỉ là tên hàm thôi
trainer = Trainer(
    model = model,
    args = trainingArgs,
    train_dataset = trainDataLoader,
    eval_dataset = testDataLoader,
    compute_metrics = ComputeMetrics
)
trainer.train()

#Đánh giá và lưu
#q = [trainer.evaluate(eval_dataset = dfSupport) for dfSupport in [trainDataLoader, testDataLoader]]
train_results = trainer.evaluate(eval_dataset=trainDataLoader)
test_results = trainer.evaluate(eval_dataset=testDataLoader)
#pd.DataFrame(q,index=["train","test"]).iloc[:,:5]
pd.DataFrame([train_results, test_results], index=["train", "test"]).iloc[:,:5]

#Test
text = "Hello!"
Predict(text)

#Lưu mô hình
model_path = "ChatBot"
trainer.save_model(model_path)
tokenizer.save_pretrained(model_path)