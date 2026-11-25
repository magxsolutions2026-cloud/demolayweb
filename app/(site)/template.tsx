/**
 * Re-mounts on every navigation: a single quick fade (see `.page-enter` in globals.css). Opacity only, because a
 * transform here would make the home page's fixed background video position against this wrapper.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
