"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Language = "English" | "French" | "Spanish" | "Portuguese" | "German" | "Arabic" | "Mandarin Chinese";

const translations: Record<Language, Record<string, string>> = {
  English: {
    settings: "Settings",
    twilioConfiguration: "Twilio Configuration",
    audioSettings: "Audio Settings",
    darkMode: "Dark Mode",
    defaultCountry: "Default Country",
    language: "Language",
    notifications: "Notifications",
    privacy: "Privacy",
    about: "About JML Dialer",
    logOut: "Log Out",
    dialer: "Dialer",
    contacts: "Contacts",
    messages: "Messages",
    calls: "Calls",
  },
  French: {
    settings: "Paramètres",
    twilioConfiguration: "Configuration Twilio",
    audioSettings: "Paramètres audio",
    darkMode: "Mode sombre",
    defaultCountry: "Pays par défaut",
    language: "Langue",
    notifications: "Notifications",
    privacy: "Confidentialité",
    about: "À propos de JML Dialer",
    logOut: "Se déconnecter",
    dialer: "Composeur",
    contacts: "Contacts",
    messages: "Messages",
    calls: "Appels",
  },
  Spanish: {
    settings: "Configuración",
    twilioConfiguration: "Configuración de Twilio",
    audioSettings: "Configuración de audio",
    darkMode: "Modo oscuro",
    defaultCountry: "País predeterminado",
    language: "Idioma",
    notifications: "Notificaciones",
    privacy: "Privacidad",
    about: "Acerca de JML Dialer",
    logOut: "Cerrar sesión",
    dialer: "Marcador",
    contacts: "Contactos",
    messages: "Mensajes",
    calls: "Llamadas",
  },
  Portuguese: {
    settings: "Configurações",
    twilioConfiguration: "Configuração do Twilio",
    audioSettings: "Configurações de áudio",
    darkMode: "Modo escuro",
    defaultCountry: "País padrão",
    language: "Idioma",
    notifications: "Notificações",
    privacy: "Privacidade",
    about: "Sobre o JML Dialer",
    logOut: "Sair",
    dialer: "Discador",
    contacts: "Contatos",
    messages: "Mensagens",
    calls: "Chamadas",
  },
  German: {
    settings: "Einstellungen",
    twilioConfiguration: "Twilio-Konfiguration",
    audioSettings: "Audioeinstellungen",
    darkMode: "Dunkler Modus",
    defaultCountry: "Standardland",
    language: "Sprache",
    notifications: "Benachrichtigungen",
    privacy: "Datenschutz",
    about: "Über JML Dialer",
    logOut: "Abmelden",
    dialer: "Wählhilfe",
    contacts: "Kontakte",
    messages: "Nachrichten",
    calls: "Anrufe",
  },
  Arabic: {
    settings: "الإعدادات",
    twilioConfiguration: "إعدادات Twilio",
    audioSettings: "إعدادات الصوت",
    darkMode: "الوضع الداكن",
    defaultCountry: "الدولة الافتراضية",
    language: "اللغة",
    notifications: "الإشعارات",
    privacy: "الخصوصية",
    about: "حول JML Dialer",
    logOut: "تسجيل الخروج",
    dialer: "لوحة الاتصال",
    contacts: "جهات الاتصال",
    messages: "الرسائل",
    calls: "المكالمات",
  },
  "Mandarin Chinese": {
    settings: "设置",
    twilioConfiguration: "Twilio 配置",
    audioSettings: "音频设置",
    darkMode: "深色模式",
    defaultCountry: "默认国家",
    language: "语言",
    notifications: "通知",
    privacy: "隐私",
    about: "关于 JML Dialer",
    logOut: "退出登录",
    dialer: "拨号盘",
    contacts: "联系人",
    messages: "消息",
    calls: "通话",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("English");
  const supabase = createClient();

  useEffect(() => {
    async function loadLanguage() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const { data: settings } = await supabase
        .from("settings")
        .select("language")
        .eq("user_id", userId)
        .single();

      if (settings?.language && translations[settings.language as Language]) {
        setLanguageState(settings.language as Language);
      }
    }
    loadLanguage();
  }, [supabase]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    await supabase.from("settings").upsert(
      { user_id: userId, language: lang },
      { onConflict: "user_id" }
    );
  };

  const t = (key: string): string => {
    return translations[language]?.[key] ?? translations.English[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}