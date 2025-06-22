"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { markPaymentCompleted } from '@/app/actions/payment';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completePayment() {
      if (sessionId && paymentId) {
        try {
          const result = await markPaymentCompleted(paymentId, sessionId, 'CARD');
          
          if (!result.success) {
            setError(result.message || 'Failed to mark payment as completed');
          }
        } catch (err) {
          setError('An error occurred while completing your payment');
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      } else {
        setError('Missing session or payment information');
        setIsProcessing(false);
      }
    }
    
    completePayment();
  }, [sessionId, paymentId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center text-center space-y-6">
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <h2 className="text-xl font-semibold">Processing your payment...</h2>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <span className="text-red-600 text-2xl">❌</span>
              </div>
              <h2 className="text-xl font-semibold text-red-700">Payment Error</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Payment Successful!</h2>
              <p className="text-gray-600">
                Your payment has been processed successfully. Thank you for your payment.
              </p>
            </>
          )}

          <div className="pt-6">
            <Link href="/record/appointments">
              <Button className="w-full">
                Return to Appointments
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}