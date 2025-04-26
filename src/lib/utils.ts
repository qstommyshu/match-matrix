import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Application } from "./database"; // Assuming Application type is here or imported

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get stage badge color
export const getStageBadgeColor = (stage: Application["stage"]) => {
  switch (stage) {
    case "Applied":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Screening":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Interview":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Offer":
      return "bg-green-100 text-green-800 border-green-200";
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "Withdrawn":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
