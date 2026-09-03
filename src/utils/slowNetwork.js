const withSlowNetworkWarning = (promiseFn, { thresholdMs = 8000, message = "Your internet seems slow. Please wait, we are still saving..." } = {}) => {
  let didWarn = false;
  const timer = setTimeout(() => {
    didWarn = true;
    Swal.fire({
      icon: "warning",
      title: "Slow Connection",
      text: message,
      toast: true,
      position: "top-end",
      timer: 6000,
      showConfirmButton: false,
    });
  }, thresholdMs);

  return promiseFn().finally(() => {
    clearTimeout(timer);
  });
};