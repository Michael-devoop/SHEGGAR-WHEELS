import NotFoundPanel from "@/components/layout/NotFoundPanel";

/**
 * Owner 404. Rendered inside the owner layout, which already provides the
 * `main#main` landmark, so this page must not add another one.
 */
export default function OwnerNotFound() {
  return (
    <div className="shell flex flex-col py-20">
      <NotFoundPanel
        title="We could not find that page"
        body="The car may have been removed, or the link may be out of date."
        actionHref="/owner"
        actionLabel="Back to my cars"
      />
    </div>
  );
}
