import React from "react";

interface PageTitleProps {
  title: string;
  description?: string;
}

// PageTitle displays a page heading and optional description for consistent section headers
// Props: title (required), description (optional)
export const PageTitle: React.FC<PageTitleProps> = ({ title, description }) => {
  return (
    <div className="mb-6">
      {/* Main page title */}
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {/* Optional description below the title */}
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
};