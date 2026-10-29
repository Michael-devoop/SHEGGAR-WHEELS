export interface NavItem {
  href: string;
  label: string;
}

/** Longest route match wins, so "/admin" is not active on "/admin/users". */
export function activeNavHref(
  items: readonly NavItem[],
  pathname: string,
): string | undefined {
  return items
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
