import React, { useState } from "react";

function App() {
  const [lyrics, setLyrics] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lyrics }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          maxWidth: "700px",
          margin: "auto",
          padding: "2rem",
          borderRadius: "15px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{ textAlign: "center", color: "#444", marginBottom: "1.5rem" }}
        >
          🎵 LyricMood: Song Emotion Classifier
        </h1>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="lyrics"
            style={{
              fontWeight: "bold",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Enter Song Lyrics:
          </label>
          <textarea
            id="lyrics"
            rows="6"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Type your song lyrics here..."
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "1rem",
              borderRadius: "10px",
              border: "1px solid #ccc",
              resize: "vertical",
              marginBottom: "1rem",
              backgroundColor: "#f9f9f9",
            }}
          />
          <button
            type="submit"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              fontWeight: "bold",
              backgroundColor: isHovered ? "#e86441" : "#ff7e5f",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
          >
            Predict Emotion
          </button>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>
        )}

        {result && (
          <div
            style={{
              marginTop: "2rem",
              backgroundColor: "#f4f4f4",
              padding: "1rem",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>
              🎯 <strong>Predicted Emotion:</strong>{" "}
              <span style={{ color: "#2e8b57" }}>
                {result.predicted_emotion}
              </span>
            </h3>
            <h4 style={{ marginBottom: "0.5rem" }}>
              📊 Emotion Probabilities:
            </h4>
            <ul>
              {Object.entries(result.emotion_probabilities).map(
                ([emotion, prob]) => (
                  <li key={emotion}>
                    {emotion}: <strong>{prob}</strong>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
