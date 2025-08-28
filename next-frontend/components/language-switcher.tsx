"use client";

import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(value: 'en' | 'fr') => setLanguage(value)}>
      <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white hover:bg-white/20">
        <SelectValue>
          {language === 'fr' ? '🇫🇷 FR' : '🇺🇸 EN'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-white/20">
        <SelectItem value="en" className="text-white hover:bg-white/10">
          🇺🇸 English
        </SelectItem>
        <SelectItem value="fr" className="text-white hover:bg-white/10">
          🇫🇷 Français
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="bg-white/10 border-white/20 text-white hover:bg-white/20 min-w-[60px]"
    >
      {language === 'fr' ? '🇫🇷 FR' : '🇺🇸 EN'}
    </Button>
  );
}
