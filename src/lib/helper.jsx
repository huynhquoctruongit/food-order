export function getHostname() {
  const href = location.hostname;
  if (href.indexOf("youpass") > -1) {
    return ".vercel.vn";
  } else {
    return "localhost";
  }
}
