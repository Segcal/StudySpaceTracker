import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentModal from './payment-modal';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface PaymentWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentType: 'income_tax' | 'property_tax' | 'utility_bill';
  title: string;
  clientSecret: string;
}

export default function PaymentWrapper(props: PaymentWrapperProps) {
  if (!props.clientSecret || !stripePromise) {
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret }}>
      <PaymentModal {...props} />
    </Elements>
  );
}