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
  const lang = document.getElementById('lang-select').value;
  const vocal = document.getElementById('vocal-select').value;
  const tempo = document.getElementById('tempo-select').value;
  const vibe = document.getElementById('vibe-select').value;
  const btn = document.getElementById('generate-btn');

  btn.innerText = "⏳ Generiere Titel, Song & Prompts...";
  btn.disabled = true;

  const systemPrompt = `Du bist ein hochklassiger Songwriter und Musikproduzent für Suno AI und TikTok.

Erstelle basierend auf den Wünschen des Nutzers:
1. Einen eingängigen Songtitel (maximal 4 Worte).
2. Einen englischen "Style Prompt" für Suno AI (maximal 120 Zeichen, kombinierte Vorgaben aus Instrumenten, Vocals, Tempo und Vibe).
3. Einen vollständigen, rythmischen Songtext IN DER ANGEGEBENEN SPRACHE mit Suno-Metatags wie [Intro], [Verse 1], [Chorus], [Bridge], [Outro].

WICHTIG: Antworte EXAKT in diesem Format und schreibe sonst KEINEN zusätzlichen Text:

[TITLE]
(Hier der prägnante Songtitel)

[STYLE_PROMPT]
(Hier der englische Suno-Style)

[LYRICS]
(Hier der vollständige Songtext in der gewünschten Sprache mit Metatags)`;

  const userPrompt = `Genre/Stil: ${genre}\nSprache des Songtexts: ${lang}\nGesang: ${vocal}\nTempo: ${tempo}\nStimmung: ${vibe}\nThema/Stichworte: ${topic}`;

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

      const titleMatch = fullContent.match(/\[TITLE\]([\s\S]*?)\[STYLE_PROMPT\]/);
      const styleMatch = fullContent.match(/\[STYLE_PROMPT\]([\s\S]*?)\[LYRICS\]/);
      const lyricsMatch = fullContent.split('[LYRICS]')[1];

      const titleText = titleMatch ? titleMatch[1].trim() : topic;
      const styleText = styleMatch ? styleMatch[1].trim() : `${genre}, ${vocal}, ${tempo}, ${vibe}`;
      const lyricsText = lyricsMatch ? lyricsMatch.trim() : fullContent;

      document.getElementById('title-output').value = titleText;
      document.getElementById('style-output').value = styleText;
      document.getElementById('lyrics-output').value = lyricsText;
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
  const el = document.getElementById(elementId);
  el.select();
  const val = el.value || el.innerText;
  navigator.clipboard.writeText(val);
  alert("In die Zwischenablage kopiert! 📋");
}
