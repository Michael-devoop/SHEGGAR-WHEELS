import NotFoundPanel from "@/components/layout/NotFoundPanel";

/**
 * Renter 404. Rendered inside the renter layout, which already provides the
 * `main#main` landmark, so this page must not add another one.
 */
export default function RenterNotFound() {
  return (
    <div className="shell flex flex-col py-20">
      <NotFoundPanel
        title="We could not find that booking"
        body="The booking may have been cancelled, or the link may be out of date."
        actionHref="/renter/bookings"
        actionLabel="Back to my bookings"
      />
    </div>
  );
}
