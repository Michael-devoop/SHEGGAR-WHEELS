import NotFoundPanel from "@/components/layout/NotFoundPanel";

/**
 * Root 404.
 *
 * An unmatched URL belongs to no route group, so no group layout renders
 * around it and this page supplies the `main#main` landmark itself.
 */
export default function NotFound() {
  return (
    <main id="main" className="shell flex flex-col py-20">
      <NotFoundPanel />
    </main>
  );
}
