import NotFoundPanel from "@/components/layout/NotFoundPanel";

/**
 * Admin 404. Rendered inside the admin layout, which already provides the
 * `main#main` landmark, so this page must not add another one.
 */
export default function AdminNotFound() {
  return (
    <div className="shell flex flex-col py-20">
      <NotFoundPanel
        title="That admin page does not exist"
        body="The record may have been removed, or the link may be out of date."
        actionHref="/admin"
        actionLabel="Back to admin"
      />
    </div>
  );
}
