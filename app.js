// Key sicher lokal abfragen
function getGroqApiKey() {
  let key = localStorage.getItem('dino_suno_groq_key');
  if (!key || key.trim() === '' || key.startsWith('gsk_...')) {
    key = prompt("Bitte gib deinen Groq API-Key ein (wird sicher und ausschließlich lokal auf deinem Gerät gespeichert):");
    if (key && key.trim() !== '') {
      localStorage.setItem('dino_suno_groq_key', key.trim());
    }
  }
  return key ? key.trim() : "";
}

function changeApiKey() {
  const currentKey = localStorage.getItem('dino_suno_groq_key') || '';
  const newKey = prompt("Gib deinen neuen Groq API-Key ein:", currentKey);
  if (newKey !== null) {
    localStorage.setItem('dino_suno_groq_key', newKey.trim());
    alert("API-Key gespeichert! 🔑");
  }
}

async function generateSong() {
  const topic = document.getElementById('topic-input').value.trim();
  if (!topic) {
    alert("Bitte gib ein Thema oder ein paar Stichworte ein!");
    return;
  }

  const apiKey = getGroqApiKey();
  if (!apiKey) {
    alert("Ohne API-Key kann kein Song generiert werden.");
    return;
  }

  const genre = document.getElementById('genre-select').value;
  const vibe = document.getElementById('vibe-select').value;
  const btn = document.getElementById('generate-btn');

  btn.innerText = "⏳ Generiere Song & Prompts...";
  btn.disabled = true;

  const systemPrompt = `Du bist ein professioneller Songwriter und Musikproduzent für Suno AI und TikTok.
Deine Aufgabe:
1. Erstelle einen extrem knackigen, englischen "Style Prompt" für Suno AI (maximal 120 Zeichen, beschreibe Instrumente, BPM, Genre und Gesangsstil).
2. Schreibe einen vollständigen Songtext (Deutsch/Türkisch/Rumänisch/Französisch je nach Genre) mit korrekten Suno-Metatags wie [Intro], [Verse 1], [Chorus], [Bridge], [Outro].
3. STRIKTE REGEL: Verwende NIEMALS den Namen "Dino" oder irgendeinen persönlichen Namen im Songtext!
4. Formatieren deine Antwort EXAKT so:

[STYLE_PROMPT]
Hier der englische Style-Prompt für Suno

[LYRICS]
Hier der Songtext mit den Klammer-Metatags`;

  const userPrompt = `Genre: ${genre}\nVibe/Stimmung: ${vibe}\nThema/Inhalt: ${topic}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (response.ok && data.choices && data.choices[0]?.message?.content) {
      const fullContent = data.choices[0].message.content;

      const styleMatch = fullContent.match(/\[STYLE_PROMPT\]([\s\S]*?)\[LYRICS\]/);
      const lyricsMatch = fullContent.split('[LYRICS]')[1];

      const styleText = styleMatch ? styleMatch[1].trim() : `${genre}, ${vibe}`;
      const lyricsText = lyricsMatch ? lyricsMatch.trim() : fullContent;

      document.getElementById('style-output').innerText = styleText;
      document.getElementById('lyrics-output').innerText = lyricsText;
      document.getElementById('output-section').classList.remove('hidden');
    } else {
      alert("Fehler bei der Generierung: " + (data.error?.message || "Unbekannter Fehler"));
    }
  } catch (err) {
    alert("Verbindungsfehler: " + err.message);
  } finally {
    btn.innerText = "🚀 Song & Suno Prompt Generieren";
    btn.disabled = false;
  }
}

function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text);
  alert("In die Zwischenablage kopiert! 📋");
}
