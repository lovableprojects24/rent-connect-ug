import { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, Share, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-2xl stat-card-gradient flex items-center justify-center mx-auto">
          <Smartphone className="w-10 h-10 text-primary-foreground" />
        </div>

        <h1 className="font-heading text-3xl font-bold">Install RentFlow</h1>
        <p className="text-muted-foreground">
          Add RentFlow to your home screen for instant access, offline support, and a native app experience.
        </p>

        {isInstalled ? (
          <div className="flex items-center justify-center gap-2 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">App already installed!</span>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full gap-2">
            <Download className="w-5 h-5" />
            Install App
          </Button>
        ) : isIOS ? (
          <div className="bg-card rounded-xl border border-border p-4 space-y-3 text-left">
            <p className="font-medium text-sm">To install on iPhone/iPad:</p>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                Tap the <Share className="w-4 h-4 inline mx-1" /> Share button in Safari
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                Scroll down and tap "Add to Home Screen"
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                Tap "Add" to confirm
              </li>
            </ol>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-4 space-y-3 text-left">
            <p className="font-medium text-sm">To install on Android:</p>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                Tap the <MoreVertical className="w-4 h-4 inline mx-1" /> menu in Chrome
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                Tap "Install app" or "Add to Home Screen"
              </li>
            </ol>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 pt-4">
          {[
            { label: 'Offline Access', desc: 'Works without data' },
            { label: 'Fast Launch', desc: 'Opens instantly' },
            { label: 'Push Alerts', desc: 'Rent reminders' },
          ].map((f) => (
            <div key={f.label} className="bg-card rounded-lg border border-border p-3">
              <p className="text-xs font-medium">{f.label}</p>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
