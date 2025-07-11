import React from "react";
import { MaterialIcons, Feather } from "@expo/vector-icons";

export interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color?: string;
  style?: any;
  ref?: React.Ref<any>;
}

// SF Symbol to Material Icons mapping
const iconMapping = {
  "sparkles": { library: "MaterialIcons", name: "auto-awesome" },
  "xmark.circle.fill": { library: "MaterialIcons", name: "cancel" },
  "plus": { library: "MaterialIcons", name: "add" },
  "ellipsis": { library: "MaterialIcons", name: "more-horiz" },
  "paperplane.fill": { library: "MaterialIcons", name: "send" },
  "star.fill": { library: "MaterialIcons", name: "star" },
  "star": { library: "MaterialIcons", name: "star-border" },
  "heart.fill": { library: "MaterialIcons", name: "favorite" },
  "checkmark.circle.fill": { library: "MaterialIcons", name: "check-circle" },
  "xmark": { library: "MaterialIcons", name: "close" },
  "square.and.arrow.up": { library: "MaterialIcons", name: "share" },
  "clock": { library: "MaterialIcons", name: "access-time" },
  "magnifyingglass": { library: "MaterialIcons", name: "search" },
  "chevron.left": { library: "MaterialIcons", name: "chevron-left" },
  "chevron.right": { library: "MaterialIcons", name: "chevron-right" },
  
  // Missing icons that were showing as "?"
  "face.smiling": { library: "MaterialIcons", name: "mood" },
  "flame.fill": { library: "MaterialIcons", name: "local-fire-department" },
  "chart.line.uptrend.xyaxis": { library: "MaterialIcons", name: "trending-up" },
  "wind": { library: "MaterialIcons", name: "air" },
  "leaf": { library: "MaterialIcons", name: "eco" },
  "hand.raised": { library: "MaterialIcons", name: "pan-tool" },
  "brain": { library: "MaterialIcons", name: "psychology" },
  "brain.head.profile": { library: "MaterialIcons", name: "psychology" },
  "square.grid.2x2": { library: "MaterialIcons", name: "grid-view" },
  "arrow.up.circle.fill": { library: "MaterialIcons", name: "send" },
} as const;

export type IconSymbolName = keyof typeof iconMapping;

export const IconSymbolMaterial = React.forwardRef<any, IconSymbolProps>(function IconSymbolMaterial({ name, size = 24, color = "#000000", style }, ref) {
  const iconConfig = iconMapping[name];
  
  if (!iconConfig) {
    // Fallback for unknown icons
    return <MaterialIcons name="help-outline" size={size} color={color} style={style} ref={ref} />;
  }

  const { library, name: iconName } = iconConfig;

  if (library === "MaterialIcons") {
    return <MaterialIcons name={iconName as any} size={size} color={color} style={style} ref={ref} />;
  } else {
    return <Feather name={iconName as any} size={size} color={color} style={style} ref={ref} />;
  }
});