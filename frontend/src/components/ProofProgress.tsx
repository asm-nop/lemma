import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export type Step = 0 | 1 | 2 | 3 | 4;

interface ProgressStepProps {
  step: Step;
  currentStep: Step;
  isComplete: boolean;
  isError: boolean;
}

const ProgressStep: React.FC<ProgressStepProps> = ({
  step,
  currentStep,
  isComplete,
  isError,
}) => {
  const getIcon = () => {
    if (isError) return <XCircle className="w-6 h-6 text-red-500" />;
    if (isComplete) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (step === currentStep)
      return <Loader className="w-6 h-6 text-blue-500 animate-spin" />;
    return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div className="flex items-center mb-4">
      {getIcon()}
      <div className="ml-3 text-sm font-medium text-gray-900">
        {getStepText(step)}
      </div>
    </div>
  );
};

const getStepText = (step: Step): string => {
  switch (step) {
    case 0:
      return "Generating proof";
    case 1:
      return "Sending proof to prover";
    case 2:
      return "Submitting solution on-chain";
    case 3:
      return "Polling for transaction inclusion";
    case 4:
      return "Claiming bounty";
  }
};

interface ProofProgressProps {
  currentStep: Step;
  isComplete: boolean;
  isError: boolean;
}

const ProofProgress: React.FC<ProofProgressProps> = ({
  currentStep,
  isComplete,
  isError,
}) => {
  return (
    <div className="w-80 bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Proof Submission Progress</h3>
      {[1, 2, 3, 4].map((step) => (
        <ProgressStep
          key={step}
          step={step as Step}
          currentStep={currentStep}
          isComplete={isComplete || step < currentStep}
          isError={isError && step === currentStep}
        />
      ))}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-green-600 font-semibold mt-4"
        >
          Process completed successfully!
        </motion.div>
      )}
      {isError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-red-600 font-semibold mt-4"
        >
          An error occurred. Please try again.
        </motion.div>
      )}
    </div>
  );
};

export default ProofProgress;
