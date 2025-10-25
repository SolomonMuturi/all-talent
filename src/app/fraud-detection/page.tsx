import { FraudDetector } from "@/components/fraud-detection/fraud-detector";

export default function FraudDetectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">AI Fraud Detection</h1>
        <p className="text-muted-foreground">
          Analyze transaction and player data for anomalies and potential fraud.
        </p>
      </div>
      <FraudDetector />
    </div>
  );
}
