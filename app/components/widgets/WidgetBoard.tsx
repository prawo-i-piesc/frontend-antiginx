"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { buttonClass } from "@/app/components/ui/buttonStyles";
import PageHeader, { PAGE_ACTION, PAGE_ACTION_LABEL, PAGE_PADDING } from "@/app/components/layout/PageHeader";
import { layoutOf, widgetTypes, type WidgetRegistry } from "@/app/components/widgets/contract";
import useEntrance from "@/app/hooks/useEntrance";
import { moveItem, useWidgetLayout, type WidgetConfig, type WidgetSize } from "@/app/hooks/useWidgetLayout";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { PreferenceKey } from "@/app/lib/statsApi";

const SIZE_CLASSES: Record<WidgetSize, string> = {
  "1x1": "",
  "2x1": "col-span-2",
  "1x2": "row-span-2",
  "2x2": "col-span-2 row-span-2",
};

/** How far (px) a press travels before it becomes a drag; anything shorter is a click. */
const DRAG_THRESHOLD = { mouse: 4, touch: 8 };

const CORNER_BUTTON =
  "flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-lg transition-colors";

const NEUTRAL_BUTTON = "bg-zinc-700/90 hover:bg-zinc-700 dark:bg-zinc-600/90 dark:hover:bg-zinc-600";

interface WidgetBoardProps<T extends string> {
  /** The account preference the layout is saved under. */
  storageKey: PreferenceKey;
  /** Every widget the board offers; those not on it are listed in customize mode. */
  registry: WidgetRegistry<T>;
  /** The layout of a first visit. */
  defaults: readonly T[];
  /** The page heading. */
  title: string;
  description: string;
  /** Shown above the widgets when their data could not be loaded. */
  error?: string | null;
  onRetry?: () => void;
}

interface PointerDrag {
  id: string;
  from: number;
  to: number;
  /** Where the floating preview starts; later moves are applied directly. */
  left: number;
  top: number;
  width: number;
}

type FocusRequest = { id: string; scroll: boolean } | "toggle";

/** A drag that ends over a button must not also press it. */
function swallowNextClick() {
  const swallow = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };
  window.addEventListener("click", swallow, { capture: true, once: true });
  window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
}

/**
 * A page heading and a grid of widgets the user can rearrange, remove and add
 * to; the layout is saved to the account (see useWidgetLayout).
 *
 * In customize mode every widget has a move handle. A mouse drags the card
 * from anywhere, touch only from the handle so the page still scrolls. The
 * keyboard picks a widget up with Space or Enter on the handle, moves it with
 * the arrow keys and puts it down again; Escape puts it back. Clicking the
 * handle picks the widget up too and shows arrow buttons, so moving never
 * requires dragging. A polite live region reports each change.
 */
export default function WidgetBoard<T extends string>({
  storageKey,
  registry,
  defaults,
  title,
  description,
  error = null,
  onRetry,
}: WidgetBoardProps<T>) {
  const { t } = useI18n();
  const copy = t.widgets.board;

  const library = useMemo(() => layoutOf(registry, widgetTypes(registry)), [registry]);
  const defaultLayout = useMemo(() => layoutOf(registry, defaults), [registry, defaults]);
  const layout = useWidgetLayout(storageKey, library, defaultLayout);

  const widgetName = (type: T) => registry[type].name(t);
  function renderWidget(widget: WidgetConfig<T>): ReactNode {
    const { Component } = registry[widget.type];
    return <Component />;
  }
  const { widgets, available } = layout;
  const total = widgets.length;

  const [customizing, setCustomizing] = useState(false);
  const entering = useEntrance();
  // Picked up with the keyboard or a click; Escape returns it to `origin`.
  const [grabbed, setGrabbed] = useState<{ id: string; origin: number } | null>(null);
  const [drag, setDrag] = useState<PointerDrag | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const instructionsId = useId();
  const libraryHeadingId = useId();

  const listRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const focusRequest = useRef<FocusRequest | null>(null);
  const stopPointerDrag = useRef<(() => void) | null>(null);
  // For the document listeners of a drag, which outlive the render that added them.
  const latest = useRef({ layout, widgetName, t });

  useLayoutEffect(() => {
    latest.current = { layout, widgetName, t };
  });

  // Reordering moves elements in the DOM, which can take focus with them; put
  // it back where the last action said it belongs.
  useLayoutEffect(() => {
    const request = focusRequest.current;
    if (!request) return;
    focusRequest.current = null;
    if (request === "toggle") toggleRef.current?.focus();
    else handles.current.get(request.id)?.focus({ preventScroll: !request.scroll });
  });

  useEffect(() => {
    const stop = stopPointerDrag;
    return () => stop.current?.();
  }, []);

  const displayed = useMemo(() => (drag ? moveItem(widgets, drag.from, drag.to) : widgets), [drag, widgets]);
  const dragged = drag ? widgets.find((widget) => widget.id === drag.id) : undefined;

  function announce(message: string) {
    // The same text twice in a row would not be read again.
    setAnnouncement((previous) => (previous === message ? `${message}\u00a0` : message));
  }

  function toggleCustomizing() {
    stopPointerDrag.current?.();
    setDrag(null);
    setGrabbed(null);
    setCustomizing(!customizing);
  }

  function toggleGrab(widget: WidgetConfig<T>, index: number) {
    if (drag) return;
    const name = widgetName(widget.type);
    if (grabbed?.id === widget.id) {
      setGrabbed(null);
      announce(copy.announce.dropped(name, index + 1, total));
    } else {
      // Picking up another widget leaves the previous one where it is.
      setGrabbed({ id: widget.id, origin: index });
      announce(copy.announce.grabbed(name, index + 1, total));
    }
  }

  function moveGrabbed(widget: WidgetConfig<T>, from: number, to: number) {
    if (to < 0 || to >= total || to === from) return;
    layout.move(from, to);
    focusRequest.current = { id: widget.id, scroll: true };
    announce(copy.announce.moved(widgetName(widget.type), to + 1, total));
  }

  function cancelGrab(widget: WidgetConfig<T>, index: number, origin: number) {
    if (origin !== index) {
      layout.move(index, origin);
      focusRequest.current = { id: widget.id, scroll: true };
    }
    setGrabbed(null);
    announce(copy.announce.cancelled(widgetName(widget.type), origin + 1, total));
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, widget: WidgetConfig<T>, index: number) {
    if (drag || grabbed?.id !== widget.id) return;

    let to: number;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        to = index - 1;
        break;
      case "ArrowRight":
      case "ArrowDown":
        to = index + 1;
        break;
      case "Home":
        to = 0;
        break;
      case "End":
        to = total - 1;
        break;
      case "Escape":
        event.preventDefault();
        cancelGrab(widget, index, grabbed.origin);
        return;
      default:
        return;
    }
    // These keys would scroll the page as well.
    event.preventDefault();
    moveGrabbed(widget, index, to);
  }

  function handleFocusOut(event: ReactFocusEvent<HTMLLIElement>, widget: WidgetConfig<T>, index: number) {
    if (grabbed?.id !== widget.id) return;
    const next = event.relatedTarget;
    // Tabbing out of the widget puts it down. Focus going nowhere was taken by
    // a reorder and is about to come back.
    if (!next || event.currentTarget.contains(next)) return;
    setGrabbed(null);
    announce(copy.announce.dropped(widgetName(widget.type), index + 1, total));
  }

  function removeWidget(widget: WidgetConfig<T>, index: number) {
    const item = handles.current.get(widget.id)?.closest("li");
    const hadFocus = item?.contains(document.activeElement) ?? false;
    const neighbour = widgets[index + 1] ?? widgets[index - 1];
    setGrabbed(null);
    layout.remove(widget.id);
    if (hadFocus) focusRequest.current = neighbour ? { id: neighbour.id, scroll: true } : "toggle";
    announce(copy.announce.removed(widgetName(widget.type)));
  }

  function addWidget(widget: WidgetConfig<T>, event: ReactMouseEvent<HTMLButtonElement>) {
    setGrabbed(null);
    const created = layout.add(widget);
    // The library card goes away, so focus moves to the new widget's handle:
    // scrolled into view for the keyboard (detail 0), not after a mouse click.
    focusRequest.current = { id: created.id, scroll: event.detail === 0 };
    announce(copy.announce.added(widgetName(widget.type), total + 1, total + 1));
  }

  function startPointerDrag(event: ReactPointerEvent<HTMLLIElement>, widget: WidgetConfig<T>, index: number) {
    if (!event.isPrimary || event.button !== 0 || stopPointerDrag.current) return;

    const target = event.target as Element;
    const onHandle = target.closest("[data-drag-handle]") !== null;
    // A finger on the card scrolls the page; on touch screens only the handle drags.
    if (event.pointerType !== "mouse" && !onHandle) return;
    // The widget's own links and buttons keep working.
    if (!onHandle && target.closest("a, button, input, select, textarea")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const { pointerId, clientX: startX, clientY: startY } = event;
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;
    const threshold = event.pointerType === "mouse" ? DRAG_THRESHOLD.mouse : DRAG_THRESHOLD.touch;
    let started = false;
    let to = index;

    const onMove = (move: PointerEvent) => {
      if (move.pointerId !== pointerId) return;
      const left = move.clientX - offsetX;
      const top = move.clientY - offsetY;

      if (!started) {
        if (Math.hypot(move.clientX - startX, move.clientY - startY) < threshold) return;
        started = true;
        setGrabbed(null);
        setDrag({ id: widget.id, from: index, to: index, left, top, width: rect.width });
      }
      // The preview follows the pointer without re-rendering the board.
      cloneRef.current?.style.setProperty("transform", `translate(${left}px, ${top}px)`);

      const over = document
        .elementsFromPoint(move.clientX, move.clientY)
        .find(
          (element): element is HTMLElement =>
            element instanceof HTMLElement &&
            element.dataset.widgetIndex !== undefined &&
            listRef.current?.contains(element) === true,
        );
      const overIndex = over ? Number(over.dataset.widgetIndex) : to;
      if (overIndex !== to) {
        to = overIndex;
        setDrag((current) => (current ? { ...current, to: overIndex } : current));
      }
    };

    const finish = (commit: boolean) => {
      stop();
      if (!started) return;
      setDrag(null);
      swallowNextClick();
      if (!commit || to === index) return;
      const { layout: current, widgetName: nameOf, t: messages } = latest.current;
      current.move(index, to);
      announce(messages.widgets.board.announce.dropped(nameOf(widget.type), to + 1, current.widgets.length));
    };

    const onUp = (up: PointerEvent) => {
      if (up.pointerId === pointerId) finish(true);
    };
    const onCancel = (cancel: PointerEvent) => {
      if (cancel.pointerId === pointerId) finish(false);
    };
    const onKeyDown = (key: KeyboardEvent) => {
      if (key.key !== "Escape" || !started) return;
      key.preventDefault();
      finish(false);
    };

    function stop() {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onCancel);
      document.removeEventListener("keydown", onKeyDown);
      stopPointerDrag.current = null;
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onCancel);
    document.addEventListener("keydown", onKeyDown);
    stopPointerDrag.current = stop;
  }

  return (
    <div className={`${PAGE_PADDING} ${customizing ? "select-none" : ""}`}>
      <PageHeader
        title={title}
        description={description}
        actions={
          <>
            {customizing && !layout.isDefault ? (
              <button
                type="button"
                onClick={() => {
                  // The button disappears once the board is back to the defaults: keep focus on Done.
                  focusRequest.current = "toggle";
                  layout.reset();
                  announce(copy.announce.reset);
                }}
                className={`${buttonClass("secondary")} ${PAGE_ACTION}`}
              >
                <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
                <span className={PAGE_ACTION_LABEL}>{copy.reset}</span>
              </button>
            ) : null}
            <button
              ref={toggleRef}
              type="button"
              onClick={toggleCustomizing}
              aria-pressed={customizing}
              className={`${buttonClass(customizing ? "primary" : "secondary")} ${PAGE_ACTION}`}
            >
              <i className={customizing ? "ri-check-line" : "ri-edit-line"} aria-hidden="true"></i>
              <span className={PAGE_ACTION_LABEL}>{customizing ? t.common.done : copy.customize}</span>
            </button>
          </>
        }
      />

      {customizing ? (
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          {copy.dragHint} <span id={instructionsId}>{copy.keyboardHint}</span>
        </p>
      ) : null}

      <div role="status" className="sr-only">
        {announcement}
      </div>

      {/* Always rendered, so the message is announced when it appears. */}
      <div
        className={
          error
            ? "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            : undefined
        }
      >
        <p role="alert">{error}</p>
        {error && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer rounded-lg border border-red-300 bg-white px-3 py-1.5 font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-500/40 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/20"
          >
            {t.common.retry}
          </button>
        ) : null}
      </div>

      {displayed.length > 0 ? (
        <ul
          ref={listRef}
          role="list"
          className={`relative mb-4 grid grid-cols-2 gap-3 sm:gap-4 @4xl:grid-cols-4 ${entering ? "stagger" : ""}`}
        >
          {displayed.map((widget, index) => {
            const name = widgetName(widget.type);
            const isGrabbed = grabbed?.id === widget.id;
            const isDragged = drag?.id === widget.id;

            return (
              <li
                key={widget.id}
                data-widget-index={index}
                onPointerDown={customizing ? (event) => startPointerDrag(event, widget, index) : undefined}
                onBlur={(event) => handleFocusOut(event, widget, index)}
                className={`group relative h-full rounded-xl ${SIZE_CLASSES[widget.size]} ${
                  isDragged ? "scale-95 opacity-50" : "scale-100 opacity-100"
                } ${
                  isGrabbed
                    ? "ring-2 ring-cyan-600 ring-offset-2 ring-offset-zinc-100 dark:ring-cyan-400 dark:ring-offset-zinc-950"
                    : ""
                }`}
                style={{
                  cursor: customizing ? "move" : undefined,
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {customizing ? (
                  // Centred on the top edge: the corners hold this card's and the
                  // neighbour's remove buttons, a grid gap apart.
                  <div className="absolute -top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
                    {/* The instructions are heard on the way in, not again after every move. */}
                    <button
                      ref={(element) => {
                        if (element) handles.current.set(widget.id, element);
                        else handles.current.delete(widget.id);
                      }}
                      type="button"
                      data-drag-handle=""
                      onClick={() => toggleGrab(widget, index)}
                      onKeyDown={(event) => handleKeyDown(event, widget, index)}
                      aria-label={copy.move(name)}
                      aria-pressed={isGrabbed}
                      aria-describedby={isGrabbed ? undefined : instructionsId}
                      className={`${CORNER_BUTTON} cursor-grab touch-none active:cursor-grabbing ${
                        isGrabbed ? "bg-cyan-700" : NEUTRAL_BUTTON
                      }`}
                    >
                      <i className="ri-drag-move-2-line text-sm" aria-hidden="true"></i>
                    </button>

                    {/* For pointers that cannot drag. Out of the tab order: the
                        keyboard has the arrow keys, and focus stays on the handle. */}
                    {isGrabbed ? (
                      <>
                        <button
                          type="button"
                          tabIndex={-1}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => moveGrabbed(widget, index, index - 1)}
                          disabled={index === 0}
                          aria-label={copy.moveEarlier}
                          className={`${CORNER_BUTTON} ${NEUTRAL_BUTTON} order-first cursor-pointer disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          <i className="ri-arrow-left-s-line text-base" aria-hidden="true"></i>
                        </button>
                        <button
                          type="button"
                          tabIndex={-1}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => moveGrabbed(widget, index, index + 1)}
                          disabled={index === total - 1}
                          aria-label={copy.moveLater}
                          className={`${CORNER_BUTTON} ${NEUTRAL_BUTTON} cursor-pointer disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          <i className="ri-arrow-right-s-line text-base" aria-hidden="true"></i>
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : null}

                {customizing && !drag ? (
                  // Touch screens have no hover, so there it is always shown.
                  <div className="absolute -right-2 -top-2 z-10 opacity-100 transition-opacity pointer-fine:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => removeWidget(widget, index)}
                      aria-label={copy.remove(name)}
                      className={`${CORNER_BUTTON} cursor-pointer bg-red-500/90 hover:bg-red-500`}
                    >
                      <i className="ri-close-line text-sm" aria-hidden="true"></i>
                    </button>
                  </div>
                ) : null}

                {renderWidget(widget)}
              </li>
            );
          })}
        </ul>
      ) : null}

      {drag && dragged ? (
        <div
          ref={cloneRef}
          aria-hidden="true"
          inert
          className="pointer-events-none fixed left-0 top-0 z-50 opacity-80"
          style={{ width: drag.width, transform: `translate(${drag.left}px, ${drag.top}px)` }}
        >
          <div className="rounded-xl border-2 border-cyan-500 bg-white shadow-2xl dark:bg-zinc-900">
            {renderWidget(dragged)}
          </div>
        </div>
      ) : null}

      {customizing && available.length > 0 ? (
        <section aria-labelledby={libraryHeadingId}>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-300 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center">
              <h2
                id={libraryHeadingId}
                className="bg-zinc-100 px-4 text-sm font-medium text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400"
              >
                {copy.available}
              </h2>
            </div>
          </div>

          <ul role="list" className="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4 @4xl:grid-cols-4">
            {available.map((widget) => (
              <li
                key={widget.type}
                className={`group/library relative transition-all hover:scale-[1.02] ${SIZE_CLASSES[widget.size]}`}
              >
                {/* A picture of the widget, not something to read or tab into. */}
                <div
                  inert
                  aria-hidden="true"
                  className="h-full opacity-80 transition-opacity group-hover/library:opacity-100 group-focus-within/library:opacity-100"
                >
                  {renderWidget(widget)}
                </div>
                <button
                  type="button"
                  onClick={(event) => addWidget(widget, event)}
                  className="absolute inset-0 cursor-pointer rounded-xl transition-colors hover:bg-cyan-500/10"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 text-white opacity-100 shadow-lg transition-opacity pointer-fine:opacity-0 group-hover/library:opacity-100 group-focus-within/library:opacity-100"
                  >
                    <i className="ri-add-line text-sm" aria-hidden="true"></i>
                  </span>
                  <span className="sr-only">{copy.add(widgetName(widget.type))}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
