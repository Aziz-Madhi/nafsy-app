import React from "react";
import { useTranslation } from "@/hooks/useLocale";
import { ContentUnavailable } from "@/components/ui/ContentUnavailable";
import { CenteredScreen } from "@/components/layout/BaseScreen";

export default function ExercisesScreen() {
  const { t } = useTranslation();

  return (
    <CenteredScreen>
      <ContentUnavailable
        title={t("exercises.title")}
        systemImage="heart.circle.fill"
        description={t("exercises.description")}
      />
    </CenteredScreen>
  );
}