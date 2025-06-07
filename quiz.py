import openai

def generate_quiz(text, language):
    prompt = f"Generate a 5-question quiz in {language} based on the following content:\n\n{text}"
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6
    )
    content = response['choices'][0]['message']['content']
    return content.split("\n")
