import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

type BrowseAllJobsButtonProps = {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  showIcon?: boolean;
};

export const BrowseAllJobsButton: React.FC<BrowseAllJobsButtonProps> = ({
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
}) => {
  const navigate = useNavigate();

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${showIcon ? "flex items-center gap-1" : ""}`}
      onClick={() => navigate("/jobs")}
    >
      {showIcon && <Search className="h-4 w-4" />} Browse All Jobs
    </Button>
  );
};

export default BrowseAllJobsButton;
