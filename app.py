import streamlit as st
from utils import translate_text, generate_pdf
from quiz import generate_quiz
import openai

st.set_page_config(page_title="LineSmart", page_icon="📘")
col1, col2, col3 = st.columns([1,2,1])
with col2:
    
    st.title("📘 LineSmart Technician Training Generator")

openai.api_key = st.secrets["OPENAI_API_KEY"]

language = st.radio("Select Language / Seleccionar idioma:", ["English", "Español"])

text_input = st.text_area("Paste training content or upload a file:", "")

uploaded_file = st.file_uploader("Upload a document (txt/pdf)", type=["txt", "pdf"])

if uploaded_file:
    text_input = uploaded_file.read().decode("utf-8")

if st.button("Generate Training"):
    with st.spinner("Generating..."):
        training_text = translate_text(text_input, language)
        st.subheader("🧠 Training Content")
        st.write(training_text)

        st.subheader("❓ Quiz")
        quiz = generate_quiz(training_text, language)
        for q in quiz:
            st.markdown(f"- {q}")

        st.download_button("📄 Download PDF", generate_pdf(training_text, quiz), file_name="training.pdf")
