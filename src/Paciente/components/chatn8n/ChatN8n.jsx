import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

export const ChatN8N = () => {
  useEffect(() => {
    createChat({
      webhookUrl: 'https://andreeescabrales-17.app.n8n.cloud/webhook/8eae0654-59c3-4adc-8c74-26640b8be765/chat',
      webhookConfig: {
        method: 'POST',
        headers: {}
      },
      target: '#n8n-chat',
      mode: 'window',
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      loadPreviousSession: true,
      metadata: {},
      showWelcomeScreen: false,
      defaultLanguage: 'es',
      initialMessages: [
        '👋 ¡Hola! Soy el asistente virtual de FarmaIA.',
        '💊 Puedo ayudarte a consultar medicamentos, revisar inventario o generar pedidos médicos.'
      ],
      i18n: {
        es: {
          title: 'Asistente FarmaIA 💊',
          subtitle: 'Tu asistente médico inteligente, siempre disponible para ayudarte.',
          footer: 'FarmaIA © 2025 • SENASoft',
          getStarted: 'Iniciar nueva conversación',
          inputPlaceholder: 'Escribe tu mensaje aquí...',
        },
      },
      enableStreaming: false,
    });

    // 🎨 Estilos personalizados del chat
    const root = document.documentElement;

    // Colores principales
    root.style.setProperty("--chat--color--primary", "#2563EB");
    root.style.setProperty("--chat--color--primary-shade-50", "#1E40AF");
    root.style.setProperty("--chat--color--primary--shade-100", "#1D4ED8");
    root.style.setProperty("--chat--color--secondary", "#16A34A");
    root.style.setProperty("--chat--color-white", "#FFFFFF");
    root.style.setProperty("--chat--color-light", "#F1F5F9");
    root.style.setProperty("--chat--color-dark", "#0F172A");

    // 💬 Mensajes
    root.style.setProperty("--chat--message--bot--background", "#E0F2FE");
    root.style.setProperty("--chat--message--bot--color", "#1E293B");
    root.style.setProperty("--chat--message--user--background", "#DCFCE7");
    root.style.setProperty("--chat--message--user--color", "#0F172A");

    // 🪄 Cabecera
    root.style.setProperty("--chat--header--background", "linear-gradient(90deg, #2563EB, #1E40AF)");
    root.style.setProperty("--chat--header--color", "#FFFFFF");
    root.style.setProperty("--chat--heading--font-size", "1.25rem");
    root.style.setProperty("--chat--subtitle--font-size", "0.9rem");

    // 🎯 Botón flotante
    root.style.setProperty("--chat--toggle--background", "#2563EB");
    root.style.setProperty("--chat--toggle--hover--background", "#1E40AF");
    root.style.setProperty("--chat--toggle--active--background", "#1D4ED8");
    root.style.setProperty("--chat--toggle--color", "#FFFFFF");
    root.style.setProperty("--chat--toggle--size", "56px");
    root.style.setProperty("--chat--border-radius", "1rem");

    // 📱 Ventana del chat
    root.style.setProperty("--chat--window--width", "400px");
    root.style.setProperty("--chat--window--height", "600px");
    root.style.setProperty("--chat--box-shadow", "0 4px 12px rgba(0,0,0,0.15)");
  }, []);

  return <div id="n8n-chat"></div>;
};
