import NotFoundPanel from "@/components/layout/NotFoundPanel";

/**
 * Car 404. Rendered inside the public layout, which already provides the
 * `main#main` landmark, so this page must not add another one.
 */
export default function CarNotFound() {
  return (
    <div className="shell flex flex-col py-20">
      <NotFoundPanel
        title="This car is no longer listed"
        body="The owner may have taken it off the road, or the link is out of date."
        actionHref="/cars"
        actionLabel="Browse other cars"
      />
    </div>
  );
}
