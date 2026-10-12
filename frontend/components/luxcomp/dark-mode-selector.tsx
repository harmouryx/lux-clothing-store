"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Listbox, Transition } from "@headlessui/react";
import { SunIcon, MoonIcon, MonitorIcon, CheckIcon } from "lucide-react";

type ThemeOption = {
  id: "light" | "dark" | "system";
  name: string;
  icon: React.ReactNode;
};

const themeOptions: ThemeOption[] = [
  {
    id: "light",
    name: "Light",
    icon: <SunIcon className="size-4" />,
  },
  {
    id: "dark",
    name: "Dark",
    icon: <MoonIcon className="size-4" />,
  },
  {
    id: "system",
    name: "System",
    icon: <MonitorIcon className="size-4" />,
  },
];

export default function DarkModeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const currentOption =
    themeOptions.find((opt) => opt.id === theme) || themeOptions[2];

  if (!mounted) {
    return (
      <div className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground" />
    );
  }

  return (
    <Listbox value={currentOption} onChange={(option) => setTheme(option.id)}>
      {({ open }) => (
        <div className="relative inline-block text-left">
          {/* Main Toggle Button */}
          <Listbox.Button
            className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <MoonIcon className="size-4" />
            ) : (
              <SunIcon className="size-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Listbox.Button>

          {/* Responsive Dropdown Menu */}
          <Transition
            show={open}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Listbox.Options className="absolute right-0 z-50 mt-2 min-w-[9rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg backdrop-blur-md focus:outline-hidden">
              {themeOptions.map((option) => (
                <Listbox.Option
                  key={option.id}
                  value={option}
                  className={({ active, selected }) =>
                    `relative flex cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-popover-foreground"
                    } ${selected ? "text-primary font-semibold" : ""}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{option.icon}</span>
                        <span>{option.name}</span>
                      </div>
                      {selected && <CheckIcon className="size-3.5 text-primary" />}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}