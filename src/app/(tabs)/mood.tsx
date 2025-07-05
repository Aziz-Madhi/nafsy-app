import React from "react";
import { useTranslation } from "@/hooks/useLocale";
import { ContentUnavailable } from "@/components/ui/ContentUnavailable";
import { CenteredScreen } from "@/components/layout/BaseScreen";

export default function MoodScreen() {
  const { t } = useTranslation();

  return (
    <CenteredScreen>
      <ContentUnavailable
        title={t("mood.title")}
        systemImage="face.smiling"
        description={t("mood.description")}
      />
    </CenteredScreen>
  );
}