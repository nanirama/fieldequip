import { client } from "@/src/sanity/lib/client";
import { settingsQuery } from "@/src/sanity/lib/queries";
import HeaderClient from "./HeaderClient";
import type { SettingsMenuData } from "./menu-types";

export interface HeaderProps {
  layout?: "dark" | "light";
  settings?: SettingsMenuData | null;
}

export default async function Header({ settings: settingsProp, ...props }: HeaderProps) {
  const settings = settingsProp ?? await client.fetch<SettingsMenuData | null>(settingsQuery) ?? {};
  return <HeaderClient {...props} settings={settings} />;
}
