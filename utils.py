import openai
import pdfkit
import tempfile

def translate_text(text, language):
    if language == "English":
        return text
    prompt = f"Translate this to Spanish:\n\n{text}"
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4
    )
    return response['choices'][0]['message']['content']

def generate_pdf(training_text, quiz_list):
    html = f"<h1>Training</h1><p>{training_text}</p><h2>Quiz</h2><ul>"
    for q in quiz_list:
        html += f"<li>{q}</li>"
    html += "</ul>"

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
        pdfkit.from_string(html, f.name)
        f.seek(0)
        return f.read()
