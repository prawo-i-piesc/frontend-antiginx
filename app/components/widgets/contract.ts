import type { ComponentType } from "react";

import type { WidgetConfig, WidgetSize } from "@/app/hooks/useWidgetLayout";
import type { Messages } from "@/app/i18n/messages/en";

/**
 * What a widget is to a board. A widget is a card that loads what it shows
 * itself, or reads the data its board shares (see WidgetData), so the board
 * knows nothing about any of them: adding one is a component and an entry
 * in the board's registry, and the page does not change.
 */
export interface WidgetDefinition {
  /** The size it is added at. */
  size: WidgetSize;
  /** Its name on the card and in the board's controls and announcements. */
  name: (messages: Messages) => string;
  Component: ComponentType;
}

/** Every widget a board offers, keyed by type. The type is what a saved layout stores. */
export type WidgetRegistry<T extends string> = Readonly<Record<T, WidgetDefinition>>;

export function widgetTypes<T extends string>(registry: WidgetRegistry<T>): T[] {
  return Object.keys(registry) as T[];
}

/** One placed widget per type, in the given order. */
export function layoutOf<T extends string>(registry: WidgetRegistry<T>, types: readonly T[]): WidgetConfig<T>[] {
  return types.map((type) => ({ id: type, type, size: registry[type].size }));
}
