#import////
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
#fast api object
app = FastAPI(title="My ML APIs")

#joblib.dump(clf, 'loan_classifier_model.pkl')
#uvicorn main:app --reload

clf = joblib.load("loan_classifier_model.pkl")

@app.get("/test")
async def testApi():
    return "Hello All"

#http://localhost:8000/docs#
@app.get("/predict-data")
async def predictDate():
    sample_input = [30,60,700,15000,36,90]
    features = np.array(sample_input).reshape(1,-1)
    print(features)
    predication = clf.predict(features)[0]
    print(f"prediction ={predication}")
    if predication == 1:
        return "Loan appreved..."
    else:
        return "Loan not approved..."

# Enable CORS so frontend can access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# model = joblib.load("TFIDFmodel.joblib")
# vectorizer = joblib.load("TFIDFvectorizer.joblib")

text_model = joblib.load("TFIDFmodel.joblib")
text_vectorizer = joblib.load("TFIDFvectorizer.joblib")

class TextModel(BaseModel):
    text:list[str]

@app.post("/posttext")
async def getText(textModel: TextModel):
    texts = textModel.text
    text_vectors = text_vectorizer.transform(texts)      
    predictions = text_model.predict(text_vectors)

    results = []
    for text, pred in zip(texts, predictions):
        results.append({
        "text": text,
        "predicted_class": pred
       })
        
    return {"results": results}


#lyric_emotion

#load the trained model and vectorizer
try:
    emotion_model = joblib.load("Lyric_Emotion_model.pkl")        # CHANGE HERE
    emotion_vectorizer = joblib.load("Lyric_Emotion_vectorizer.pkl") # CHANGE HERE
except Exception as e:
    raise RuntimeError(f"Error loading model/vectorizer: {str(e)}")


# #Create FastAPI instance
# app = FastAPI(title="LyricMood: Song Emotion Classifier")
# ✅ Add CORS middleware right after creating `app`
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Or ["http://localhost:3000"] for stricter frontend-only access
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#Input schema
class LyricsInput(BaseModel):
    lyrics: str

#Root GET endpoint(unchanged)
# @app.get("/")
# def read_root():
    # return{"message": "Welcome to LyricMood API!!"}

#POST/predict/endpoint
@app.post("/predict/")
def predict_emotion(data: LyricsInput):
    try:
        #Preprocess and vectorize
        lyrics_cleaned = data.lyrics.lower()
        lyrics_vector = emotion_vectorizer.transform([lyrics_cleaned])

        #Predict emotion and probabilities
        prediction = emotion_model.predict(lyrics_vector)[0]
        probabilities = emotion_model.predict_proba(lyrics_vector)[0]
        emotion_probs = {
            emotion: round(float(prob),4)
            for emotion, prob in zip(emotion_model.classes_,probabilities)
        }
        return{
            "input": data.lyrics,
            "predicted_emotion": prediction,
            "emotion_probabilities": emotion_probs
        }
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Prediction failed: {str(e)}")