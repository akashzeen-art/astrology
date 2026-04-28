import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "en" ? "my" : "en")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white transition-all duration-200 text-xs font-medium"
      title={language === "en" ? "Switch to Burmese" : "Switch to English"}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{language === "en" ? "မြန်မာ" : "EN"}</span>
    </button>
  );
};

export default LanguageSwitcher;
