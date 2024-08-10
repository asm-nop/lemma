import React from "react";

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className = "" }) => {
  return (
    <div className={`p-4 rounded-md ${className}`} role="alert">
      {children}
    </div>
  );
};

interface AlertTitleProps {
  children: React.ReactNode;
}

export const AlertTitle: React.FC<AlertTitleProps> = ({ children }) => {
  return <h5 className="mb-1 font-medium">{children}</h5>;
};

interface AlertDescriptionProps {
  children: React.ReactNode;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
}) => {
  return <div className="text-sm">{children}</div>;
};
