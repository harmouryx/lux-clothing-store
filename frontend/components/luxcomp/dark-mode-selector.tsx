"use client";

import { useSyncExternalStore } from "react";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/20/solid";
import { Listbox, Transition } from "@headlessui/react";
import { useTheme } from "next-themes";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type ThemeOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const themeOptions: ThemeOption[] = [
  {
    id: "light",
    name: "Light",
    icon: <SunIcon className="size-5" />,
  },
  {
    id: "dark",
    name: "Dark",
    icon: <MoonIcon className="size-5" />,
  },
  {
    id: "system",
    name: "System",
    icon: <ComputerDesktopIcon className="size-5" />,
  },
];

// Helper to detect if we are on the client side without needing useEffect
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function DarkModeSelector() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  const currentOption =
    themeOptions.find((option) => option.id === theme) || themeOptions[0];

  const DisplayIcon =
    resolvedTheme === "dark" ? (
      <MoonIcon className="size-5 text-gray-900 dark:text-gray-50" />
    ) : (
      <SunIcon className="size-5 text-gray-900 dark:text-gray-50" />
    );

  return (
    <Listbox value={currentOption} onChange={(option) => setTheme(option.id)}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className="flex items-center p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            {DisplayIcon}
          </Listbox.Button>

          <Transition
            show={open}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Listbox.Options className="absolute z-50 top-full right-0 mt-2 w-36 list-none bg-white dark:bg-slate-800 rounded-lg ring-1 ring-slate-900/10 shadow-lg overflow-hidden py-1 text-sm dark:ring-slate-700">
              {themeOptions.map((themeOption) => (
                <Listbox.Option
                  key={themeOption.id}
                  value={themeOption}
                  className={({ active, selected }) =>
                    classNames(
                      active ? "bg-gray-100 dark:bg-slate-700/50" : "",
                      selected
                        ? "text-purple-600 dark:text-purple-400 font-semibold"
                        : "text-gray-900 dark:text-gray-50 font-normal",
                      "relative cursor-pointer select-none py-2 px-3 flex items-center gap-3"
                    )
                  }
                >
                  <span className="flex-shrink-0">{themeOption.icon}</span>
                  <span>{themeOption.name}</span>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
