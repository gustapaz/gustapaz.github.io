// Capture only demos on the owner's Pages or explicitly named portfolio hosting.
export function captureUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password || u.port || u.search) return null;
    const owned = u.hostname === 'gustapaz.github.io' || /^[a-z0-9-]+-gustapaz\.starrylinen\.chatgpt\.site$/.test(u.hostname);
    return owned ? u.href : null;
  } catch { return null; }
}
export function allowedRequest(value, method, origin) {
  try {
    const u = new URL(value);
    if (!['GET', 'HEAD'].includes(method) || u.protocol !== 'https:' || u.username || u.password || u.port) return false;
    // No arbitrary outbound network, private IPs, analytics or authenticated APIs.
    return u.origin === origin || ['fonts.googleapis.com', 'fonts.gstatic.com', 'images.unsplash.com', 'cdn.jsdelivr.net', 'unpkg.com'].includes(u.hostname);
  } catch { return false; }
}
export function needsCapture(preview, repo, now = Date.now()) {
  return !preview || (preview.kind === 'live' && (preview.updated !== repo.updated || preview.source !== captureUrl(repo.demo) || !Number.isFinite(Date.parse(preview.capturedAt)) || now - Date.parse(preview.capturedAt) > 7 * 86400000));
}
