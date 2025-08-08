// bootstrap.js
(function () {
    // find the current script tag
    const current = document.currentScript || document.querySelector('script[data-bot]');
    const embedToken = current?.getAttribute('data-bot');
    const origin = (new URL(current.src)).origin; // e.g. http://localhost:4000

    // create an iframe pointing to /embed, pass embedToken via hash
    const iframe = document.createElement('iframe');
    iframe.src = `${origin}/embed#token=${encodeURIComponent(embedToken)}`;
    iframe.allow = 'storage-access';
    iframe.style.border = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.zIndex = '2147483647'; // on top

    document.body.appendChild(iframe);

    // Resize later when widget loads itself (postMessage handshake optional)
})();
