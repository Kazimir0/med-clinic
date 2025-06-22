import React from "react";

interface PageTitleProps {
  title: string;
  description?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
};