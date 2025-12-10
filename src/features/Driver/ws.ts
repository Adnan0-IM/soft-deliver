type WSOpts = {
  onOpen?: () => void;
  onClose?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRequest?: (payload: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (err: any) => void;
};

let socket: WebSocket | null = null;

export function connectDriverRequestsWS(opts: WSOpts = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  const token = localStorage.getItem("token");
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const url = `${proto}://${window.location.host}/ws/driver/requests${
    token ? `?token=${encodeURIComponent(token)}` : ""
  }`;

  socket = new WebSocket(url);

  socket.onopen = () => {
    opts.onOpen?.();
  };

  socket.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data);
      // Support both legacy and new event names
      if (msg.type === "job_request" || msg.type === "new_job_request") {
        opts.onRequest?.(msg.payload);
      }
    } catch {
      // ignore malformed messages
    }
  };

  socket.onerror = (e) => opts.onError?.(e);

  socket.onclose = () => {
    socket = null;
    opts.onClose?.();
  };

  return socket;
}

export function disconnectDriverRequestsWS() {
  if (socket) {
    try {
      socket.close();
    } finally {
      socket = null;
    }
  }
}
