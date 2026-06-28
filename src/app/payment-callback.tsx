// src/app/payment-callback.tsx
import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const statusParam = searchParams.get('status');

    if (statusParam === 'success') {
      setStatus('success');
      // Mettre à jour la base de données
      // Rediriger l'utilisateur après quelques secondes
      setTimeout(() => {
        window.location.href = '/?tab=news';
      }, 3000);
    } else if (statusParam === 'failed' || statusParam === 'cancelled') {
      setStatus('failed');
      setTimeout(() => {
        window.location.href = '/?tab=news';
      }, 3000);
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EBF3FC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B2E8A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification du paiement en cours...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EBF3FC] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Paiement Réussi !</h2>
          <p className="text-gray-500 text-sm mb-6">
            Votre inscription a été validée. Vous recevrez une confirmation par email.
          </p>
          <p className="text-xs text-gray-400">Redirection dans quelques secondes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBF3FC] px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Paiement Échoué</h2>
        <p className="text-gray-500 text-sm mb-6">
          Le paiement n'a pas pu être complété. Veuillez réessayer.
        </p>
        <p className="text-xs text-gray-400">Redirection dans quelques secondes...</p>
      </div>
    </div>
  );
}