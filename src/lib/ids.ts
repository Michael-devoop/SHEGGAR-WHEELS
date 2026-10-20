/**
 * Identifier generation.
 *
 * `crypto.randomUUID` is available in every supported browser and in Node 19+.
 * The fallback exists for older embedded webviews and for non-secure contexts
 * where `crypto` is present but `randomUUID` is not.
 */
export function newId(prefix = ""): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${id}` : id;
}
