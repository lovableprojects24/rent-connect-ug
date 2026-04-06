import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';

interface PesapalPayButtonProps {
  amount: number;
  paymentId: string;
  description?: string;
  currency?: string;
  onSuccess?: () => void;
}

export default function PesapalPayButton({
  amount,
  paymentId,
  description,
  currency = 'UGX',
  onSuccess,
}: PesapalPayButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!user) {
      toast.error('You must be logged in to pay');
      return;
    }

    setLoading(true);
    try {
      const callbackUrl = `${window.location.origin}/portal?payment=success`;

      const { data, error } = await supabase.functions.invoke('pesapal', {
        body: {
          amount,
          currency,
          description: description || 'RentFlow Payment',
          payment_id: paymentId,
          callback_url: callbackUrl,
        },
      });

      if (error) throw error;

      if (data?.redirect_url) {
        window.open(data.redirect_url, '_blank');
        toast.success('Redirecting to Pesapal payment page…');
        onSuccess?.();
      } else {
        toast.error('Failed to get payment URL');
      }
    } catch (err: any) {
      console.error('Pesapal error:', err);
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePay} disabled={loading} variant="outline" className="gap-2">
      <ExternalLink className="w-4 h-4" />
      {loading ? 'Processing…' : `Pay ${currency} ${amount.toLocaleString()} via Pesapal`}
    </Button>
  );
}
