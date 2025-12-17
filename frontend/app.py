"""
Streamlit chatbot UI
"""
import streamlit as st
import requests
import json
from datetime import datetime
from typing import Dict, List

from ui_components import (
    display_chat_message, display_intent_card, display_stats_dashboard,
    display_intent_options, display_error_message, display_success_message,
    get_confidence_badge
)

API_BASE_URL = "http://localhost:8000"

st.set_page_config(
    page_title="Collegewala Chatbot",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🎓 Collegewala Chatbot")
st.markdown("**Your AI-powered assistant for Collegewala college information**")


@st.cache_resource
def get_api_health():
    """Check API health"""
    try:
        response = requests.get(f"{API_BASE_URL}/health/status", timeout=5)
        return response.status_code == 200
    except:
        return False


def send_message(message: str) -> Dict:
    """Send message to chatbot API"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/chat/ask",
            json={"message": message},
            timeout=10
        )
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": response.json().get("detail", "Unknown error")}
    except requests.exceptions.ConnectionError:
        return {"error": "Could not connect to chatbot server. Is the backend running?"}
    except Exception as e:
        return {"error": str(e)}


def get_chat_stats() -> Dict:
    """Get chatbot statistics"""
    try:
        response = requests.get(f"{API_BASE_URL}/health/stats", timeout=5)
        if response.status_code == 200:
            return response.json().get("data", {})
    except:
        pass
    return {}


def get_available_intents() -> List[str]:
    """Get available intents"""
    try:
        response = requests.get(f"{API_BASE_URL}/chat/intents", timeout=5)
        if response.status_code == 200:
            return response.json().get("data", [])
    except:
        pass
    return []


def main():
    """Main Streamlit app"""

    with st.sidebar:
        st.header("⚙️ Settings")

        api_health = get_api_health()
        if api_health:
            st.success("✅ Backend Connected")
        else:
            st.error("❌ Backend Offline")
            st.info("Please start the backend server on localhost:8000")

        st.divider()

        st.subheader("📊 Statistics")
        stats = get_chat_stats()
        if stats:
            display_stats_dashboard(stats)
        else:
            st.info("Statistics unavailable")

        st.divider()

        st.subheader("📌 Available Intents")
        intents = get_available_intents()
        if intents:
            for intent in intents:
                st.write(f"• {intent}")
        else:
            st.info("Intents unavailable")

        st.divider()

        if st.button("🔄 Refresh Status", use_container_width=True):
            st.rerun()

    if "messages" not in st.session_state:
        st.session_state.messages = []

    chat_container = st.container()

    with st.container():
        st.subheader("💬 Chat")

        col1, col2 = st.columns([4, 1])

        with col1:
            user_input = st.text_input(
                "Ask me anything about Collegewala...",
                placeholder="e.g., What are the courses offered?",
                label_visibility="collapsed"
            )

        with col2:
            send_button = st.button("Send", use_container_width=True)

        if send_button and user_input:
            if not api_health:
                display_error_message("Backend server is not running. Please start it first.")
            else:
                st.session_state.messages.append({
                    "role": "user",
                    "content": user_input,
                    "timestamp": datetime.now().isoformat()
                })

                with st.spinner("Thinking..."):
                    response = send_message(user_input)

                if "error" in response:
                    display_error_message(response["error"])
                else:
                    bot_response = {
                        "role": "assistant",
                        "content": response.get("response", ""),
                        "intent": response.get("intent", "unknown"),
                        "confidence": response.get("confidence", 0.0),
                        "source": response.get("source", "unknown"),
                        "timestamp": datetime.now().isoformat()
                    }

                    st.session_state.messages.append(bot_response)
                    st.rerun()

    st.divider()

    st.subheader("📝 Conversation")

    if st.session_state.messages:
        for msg in st.session_state.messages:
            if msg["role"] == "user":
                st.write(f"👤 **You:** {msg['content']}")
            else:
                with st.container(border=True):
                    st.write(f"🤖 **Chatbot:** {msg['content']}")

                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.caption(f"Intent: **{msg['intent'].upper()}**")
                    with col2:
                        st.caption(f"Confidence: **{msg['confidence']:.2%}**")
                    with col3:
                        source_label = "Knowledge Base" if msg['source'] == "knowledge_base" else "Fallback"
                        st.caption(f"Source: **{source_label}**")
    else:
        st.info("No messages yet. Start by typing a question!")

    st.divider()

    col1, col2, col3 = st.columns(3)

    with col1:
        if st.button("📚 Courses", use_container_width=True):
            user_input = "Tell me about the courses offered"
            st.session_state.messages.append({
                "role": "user",
                "content": user_input,
                "timestamp": datetime.now().isoformat()
            })
            st.rerun()

    with col2:
        if st.button("🎓 Admissions", use_container_width=True):
            user_input = "How do I apply for admission?"
            st.session_state.messages.append({
                "role": "user",
                "content": user_input,
                "timestamp": datetime.now().isoformat()
            })
            st.rerun()

    with col3:
        if st.button("ℹ️ About", use_container_width=True):
            user_input = "Tell me about the college"
            st.session_state.messages.append({
                "role": "user",
                "content": user_input,
                "timestamp": datetime.now().isoformat()
            })
            st.rerun()

    st.divider()

    if st.session_state.messages:
        if st.button("🗑️ Clear Chat History", use_container_width=True):
            st.session_state.messages = []
            st.rerun()


if __name__ == "__main__":
    main()
