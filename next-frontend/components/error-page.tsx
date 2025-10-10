"use client";

import { useTranslations } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const biblicalVerses = {
  en: [
    {
      text: "\"For where two or three gather in my name, there am I with them.\" - Matthew 18:20",
      pun: "Unfortunately, our servers didn't gather today."
    },
    {
      text: "\"Be still, and know that I am God.\" - Psalm 46:10",
      pun: "Our database is being very still right now... maybe too still."
    },
    {
      text: "\"Ask and it will be given to you; seek and you will find.\" - Matthew 7:7",
      pun: "You asked for availability, we're still seeking our servers."
    },
    {
      text: "\"In the beginning was the Word.\" - John 1:1",
      pun: "In the beginning was our code... but something got lost in translation."
    },
    {
      text: "\"I can do all things through Christ who strengthens me.\" - Philippians 4:13",
      pun: "Apparently, our servers need more strengthening."
    }
  ],
  fr: [
    {
      text: "\"Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux.\" - Matthieu 18:20",
      pun: "Malheureusement, nos serveurs ne se sont pas assemblés aujourd'hui."
    },
    {
      text: "\"Arrêtez, et sachez que je suis Dieu.\" - Psaume 46:10",
      pun: "Notre base de données s'est vraiment arrêtée... peut-être trop."
    },
    {
      text: "\"Demandez, et l'on vous donnera; cherchez, et vous trouverez.\" - Matthieu 7:7",
      pun: "Vous avez demandé vos disponibilités, nous cherchons encore nos serveurs."
    },
    {
      text: "\"Au commencement était la Parole.\" - Jean 1:1",
      pun: "Au commencement était notre code... mais quelque chose s'est perdu en route."
    },
    {
      text: "\"Je puis tout par celui qui me fortifie.\" - Philippiens 4:13",
      pun: "Apparemment, nos serveurs ont besoin de plus de fortification."
    }
  ]
};

interface ErrorPageProps {
  error?: Error | string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorPage({ error, onRetry, showRetry = true }: ErrorPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const [currentVerse, setCurrentVerse] = useState(0);
  const isEnglish = t.language === 'en';
  const verses = biblicalVerses[isEnglish ? 'en' : 'fr'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerse((prev) => (prev + 1) % verses.length);
    }, 8000); // Change verse every 8 seconds

    return () => clearInterval(interval);
  }, [verses.length]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full glass border-white/20 text-center">
        <CardHeader className="pb-4">
          <div className="text-6xl mb-4 animate-bounce">🎵</div>
          <CardTitle className="text-2xl md:text-3xl text-white mb-2">
            {t.errorPageTitle}
          </CardTitle>
          <div className="text-lg text-white/80">
            {t.errorPageSubtitle}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Rotating Biblical Verse */}
          <div className="bg-white/10 rounded-lg p-6 border border-white/20">
            <div className="text-sm text-yellow-300 mb-3 font-medium">
              {t.divineWisdom}
            </div>
            <div className="text-white/90 italic mb-4 text-sm md:text-base leading-relaxed">
              {verses[currentVerse].text}
            </div>
            <div className="text-orange-300 text-sm font-medium">
              {verses[currentVerse].pun}
            </div>
          </div>

          {/* Error Details */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="text-red-300 text-sm">
                <div className="font-medium mb-1">
                  {t.technicalDetails}
                </div>
                <div className="font-mono text-xs break-all">
                  {typeof error === 'string' ? error : error.message}
                </div>
              </div>
            </div>
          )}

          {/* Encouraging Message */}
          <div className="text-white/70 text-sm">
            <p className="mb-2">
              {t.errorPageMosesJoke}
            </p>
            <p>
              {t.errorPagePrayingJoke}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {showRetry && (
              <Button 
                onClick={handleRetry}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                {t.tryAgainFaith}
              </Button>
            )}
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-6 py-2"
            >
              {t.goToHomepage}
            </Button>
          </div>

          {/* Verse Progress Indicator */}
          <div className="flex justify-center gap-2 pt-4">
            {verses.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentVerse ? 'bg-yellow-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}