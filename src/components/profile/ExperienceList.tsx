import React, { useState, useEffect } from "react";
import {
  Experience,
  addExperience,
  updateExperience,
  deleteExperience,
} from "@/lib/database";
import { useAuth } from "@/lib/AuthContext";
import { ExperienceForm, ExperienceFormValues } from "./ExperienceForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Plus,
  Building,
  GraduationCap,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ExperienceListProps {
  experiences: Experience[];
  type: "work" | "education";
  onUpdate: () => void;
  isEditable?: boolean;
}

export const ExperienceList: React.FC<ExperienceListProps> = ({
  experiences,
  type,
  onUpdate,
  isEditable = false,
}) => {
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<
    Experience | undefined
  >(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] =
    useState<Experience | null>(null);

  const filteredExperiences = experiences.filter((exp) => exp.type === type);

  // Effect to log the form state whenever it changes
  useEffect(() => {
    console.log("Form state changed:", { formOpen, selectedExperience });
  }, [formOpen, selectedExperience]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("ExperienceList handleAdd clicked for type:", type);
    setSelectedExperience(undefined);
    setFormOpen(true);
    console.log("Form should be open now, formOpen state:", true);
  };

  const handleCloseForm = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("Closing form explicitly");
    setFormOpen(false);
  };

  const handleEdit = (experience: Experience) => {
    console.log("Editing experience:", experience.id);
    setSelectedExperience(experience);
    setFormOpen(true);
  };

  const handleDelete = (experience: Experience) => {
    console.log("Deleting experience:", experience.id);
    setExperienceToDelete(experience);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!experienceToDelete) return;

    try {
      const { error } = await deleteExperience(experienceToDelete.id);
      if (error) throw error;

      toast.success(
        `${
          type === "work" ? "Work experience" : "Education"
        } deleted successfully`
      );
      onUpdate();
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("Failed to delete experience");
    } finally {
      setDeleteDialogOpen(false);
      setExperienceToDelete(null);
    }
  };

  const handleSubmit = async (values: ExperienceFormValues) => {
    console.log("ExperienceList handleSubmit called with values:", values);

    if (!user) {
      toast.error("You must be logged in to manage experiences");
      return;
    }

    try {
      if (selectedExperience) {
        // Update existing experience
        console.log(
          "Updating existing experience with ID:",
          selectedExperience.id
        );
        const { error } = await updateExperience(selectedExperience.id, values);
        if (error) throw error;
        toast.success(
          `${
            type === "work" ? "Work experience" : "Education"
          } updated successfully`
        );
      } else {
        // Add new experience
        console.log("Adding new experience for user:", user.id);
        const experienceData = {
          user_id: user.id,
          type: values.type,
          title: values.title,
          organization: values.organization,
          location: values.location || null,
          start_date: values.start_date,
          end_date: values.end_date || null,
          is_current: values.is_current,
          description: values.description || null,
        };

        console.log("Experience data to be saved:", experienceData);

        const { error } = await addExperience(experienceData);
        if (error) {
          console.error("Error from addExperience:", error);
          throw error;
        }

        toast.success(
          `${
            type === "work" ? "Work experience" : "Education"
          } added successfully`
        );
      }
      onUpdate();
      handleCloseForm(); // Close the form after successful submission
    } catch (error) {
      console.error("Error saving experience:", error);
      toast.error(
        `Failed to save ${type === "work" ? "work experience" : "education"}`
      );
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Experience list display */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">
              {type === "work" ? "Work Experience" : "Education"}
            </CardTitle>
            <CardDescription>
              Your{" "}
              {type === "work" ? "professional journey" : "academic background"}
            </CardDescription>
          </div>
          {isEditable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdd}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {type === "work" ? "Work" : "Education"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {filteredExperiences.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {type === "work"
                ? "No work experience added yet."
                : "No education details added yet."}
              {isEditable && (
                <div className="mt-2">
                  <Button
                    variant="link"
                    onClick={handleAdd}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-primary"
                  >
                    + Add {type === "work" ? "work experience" : "education"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExperiences.map((experience) => (
                <div
                  key={experience.id}
                  className="border-l-4 border-primary pl-4 py-2 relative"
                >
                  {isEditable && (
                    <div className="absolute right-0 top-2 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(experience);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(experience);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-semibold text-lg">
                      {experience.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      {type === "work" ? (
                        <Building className="h-4 w-4" />
                      ) : (
                        <GraduationCap className="h-4 w-4" />
                      )}
                      <span>{experience.organization}</span>
                    </div>
                    {experience.location && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{experience.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(experience.start_date)} -{" "}
                        {experience.is_current
                          ? "Present"
                          : formatDate(experience.end_date)}
                      </span>
                      {experience.is_current && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </div>
                    {experience.description && (
                      <p className="mt-2 text-sm">{experience.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience form dialog - Always render but control visibility with isOpen */}
      <ExperienceForm
        experience={selectedExperience}
        isOpen={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        defaultType={type}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {type === "work" ? "Work Experience" : "Education"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this{" "}
              {type === "work" ? "work experience" : "education"} entry? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExperienceToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
