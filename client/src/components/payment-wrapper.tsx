import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentModal from './payment-modal';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentType: 'income_tax' | 'property_tax' | 'utility_bill';
  title: string;
  clientSecret: string;
}

export default function PaymentWrapper(props: PaymentWrapperProps) {
  if (!props.clientSecret) {
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret }}>
      <PaymentModal {...props} />
    </Elements>
  );
}