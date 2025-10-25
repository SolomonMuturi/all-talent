import { PaymentForm } from "@/components/finances/payment-form";

export default function PayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Make a Payment</h1>
        <p className="text-muted-foreground">
          Initiate a new M-Pesa C2B payment for a player.
        </p>
      </div>
      <PaymentForm />
    </div>
  );
}
