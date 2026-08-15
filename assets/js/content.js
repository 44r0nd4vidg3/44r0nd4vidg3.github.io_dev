/* Content page: Twitch player/chat embeds and the store / X / Instagram feed
   carousel. The mobile menu is NOT handled here — site.js owns it, same as on
   every other page.
   Part of aarondavidge.com — see README.md for the file map. */

(function content() {
  var track = document.getElementById('track');
  if (!track) return;

  var CHANNEL = '44r0nd4vidg3';
  var PARENTS = ['44r0nd4vidg3.github.io', 'aarondavidge.com', 'www.aarondavidge.com'];

  /* ---------- Twitch embeds ----------
     Twitch refuses to frame unless ?parent= matches the serving host, so on
     localhost / an IP we leave the styled standby panel in place. */
  var host = location.hostname;
  var canEmbed = !!host && host !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(host);
  if (canEmbed && PARENTS.indexOf(host) === -1) PARENTS.unshift(host);
  var parents = PARENTS.map(function (h) { return 'parent=' + h; }).join('&');

  var cmdChannel = document.getElementById('cmd-channel');
  if (cmdChannel) cmdChannel.textContent = CHANNEL;
  Array.prototype.forEach.call(document.querySelectorAll('.channel-name'), function (el) {
    el.textContent = CHANNEL;
  });
  Array.prototype.forEach.call(document.querySelectorAll('.channel-link'), function (el) {
    el.href = 'https://www.twitch.tv/' + CHANNEL;
  });
  var scheduleLink = document.getElementById('schedule-link');
  if (scheduleLink) scheduleLink.href = 'https://www.twitch.tv/' + CHANNEL + '/schedule';

  function mount(id, src, title, fullscreen) {
    var target = document.getElementById(id);
    if (!target) return;
    target.textContent = '';
    var f = document.createElement('iframe');
    f.title = title;
    f.src = src;
    if (fullscreen) f.allowFullscreen = true;
    target.appendChild(f);
  }

  if (canEmbed) {
    mount('player-frame', 'https://player.twitch.tv/?channel=' + CHANNEL + '&' + parents, 'Twitch player', true);
    mount('chat-frame', 'https://www.twitch.tv/embed/' + CHANNEL + '/chat?darkpopout&' + parents, 'Twitch chat', false);
  }

  /* ---------- feed carousel ---------- */
  var note = document.getElementById('feed-note');
  var handleEl = document.getElementById('feed-handle');
  var cmdFeed = document.getElementById('cmd-feed');
  var cmdLimit = document.getElementById('cmd-limit');
  var tabs = document.querySelectorAll('[data-feed]');
  var feeds = null;
  var current = 'store';

  function stamp(iso) {
    if (!iso) return 'PENDING';
    var d = new Date(iso);
    if (isNaN(d)) return 'PENDING';
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate());
  }

  function el(tag, cls, style) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (style) n.setAttribute('style', style);
    return n;
  }

  function render() {
    var isIg = current === 'instagram';
    var isText = current === 'x';
    var isStore = current === 'store';
    var prefix = isIg ? 'IG' : (isStore ? 'SHOP' : 'X');
    var block = (feeds && feeds[current]) || {};
    var handle = isStore
      ? String(block.handle || 'store.aarondavidge.com')
      : '@' + String(block.handle || CHANNEL).replace(/^@/, '');
    var profile = isIg
      ? 'https://www.instagram.com/' + handle.slice(1) + '/'
      : (isStore
        ? (block.url || 'https://store.aarondavidge.com')
        : 'https://x.com/' + handle.slice(1));
    var posts = block.posts || [];

    handleEl.textContent = handle;
    cmdFeed.textContent = current;
    cmdLimit.textContent = String(posts.length || 6);
    Array.prototype.forEach.call(tabs, function (t) {
      t.setAttribute('aria-selected', String(t.dataset.feed === current));
    });
    note.textContent = posts.length
      ? 'Last refreshed ' + stamp(feeds && feeds.updated) + ' from feeds.json.'
      : (isText
        ? 'Slots read from feeds.json — add X posts by hand or wire the paid API.'
        : 'Slots read from feeds.json — empty until the refresh job runs.');

    track.textContent = '';
    var count = posts.length || 6;

    for (var i = 0; i < count; i++) {
      var post = posts[i] || null;
      var slot = prefix + '_' + String(i + 1).padStart(2, '0');
      var card = el('article', 'slide card-panel corner');

      if (!isText) {
        var media = el('div', 'media', post && post.image ? 'padding:0' : null);
        if (post && post.image) {
          var img = el('img');
          img.src = post.image;
          img.loading = 'lazy';
          img.alt = (post.caption || post.title || 'Post image').slice(0, 80);
          media.appendChild(img);
        } else {
          var ph = el('span', 'text-[10px] tracking-[0.2em] text-slate-500');
          ph.textContent = (isStore ? 'PRODUCT IMAGE // ' : 'DROP IMAGE // ') + slot;
          media.appendChild(ph);
        }
        card.appendChild(media);
      } else {
        var box = el('div', 'textpost');
        var icon = el('span', 'text-blue-400');
        icon.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"></path></svg>';
        box.appendChild(icon);
        var body = el('p', 'text-[12px] leading-5 ' + (post && post.text ? 'text-slate-400' : 'text-slate-500'));
        body.textContent = (post && post.text) || ('PENDING // add text for ' + slot);
        box.appendChild(body);
        card.appendChild(box);
      }

      var meta = el('div', 'flex flex-col gap-3 pt-4');
      var who = el('p', 'text-[11px] tracking-[0.15em] text-blue-300');
      who.textContent = handle;
      meta.appendChild(who);

      if (isStore && post) {
        var title = el('p', 'text-[13px] leading-5 text-slate-200');
        title.textContent = post.title || 'Untitled product';
        meta.appendChild(title);
        var priceRow = el('p', 'flex items-center gap-2 text-[12px] tracking-[0.15em] text-blue-300');
        priceRow.textContent = post.price || '';
        if (post.available === false) {
          var sold = el('span', 'text-[10px] tracking-[0.2em] text-amber-400 border border-amber-500/40 rounded px-2 py-1');
          sold.textContent = 'SOLD OUT';
          priceRow.appendChild(sold);
        }
        meta.appendChild(priceRow);
      } else if (isIg && post && post.caption) {
        var cap = el('p', 'text-[12px] leading-5 text-slate-400');
        var text = post.caption.trim();
        cap.textContent = text.length > 120 ? text.slice(0, 117) + '...' : text;
        meta.appendChild(cap);
      }

      var foot = el('div', 'cardfoot');
      var when = el('span');
      when.textContent = post ? stamp(post.timestamp) : slot + ' // PENDING';
      var link = el('a', 'text-blue-400 hover:text-blue-300 transition-colors');
      link.href = (post && post.permalink) || profile;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = isStore ? 'BUY →' : 'VIEW →';
      foot.appendChild(when);
      foot.appendChild(link);
      meta.appendChild(foot);

      card.appendChild(meta);
      track.appendChild(card);
    }

    /* trailing card out to the profile — the feed is a window, not the archive */
    var last = el('a', 'slide card-panel corner items-center justify-center gap-4 text-center text-blue-300');
    last.href = profile;
    last.target = '_blank';
    last.rel = 'noopener';
    var lastLabel = el('span', 'text-[12px] tracking-[0.25em]');
    lastLabel.textContent = isStore ? 'SHOP ALL' : 'SEE ALL POSTS';
    var lastSub = el('span', 'text-[10px] tracking-[0.2em] text-slate-600');
    lastSub.textContent = handle;
    last.appendChild(lastLabel);
    last.appendChild(lastSub);
    track.appendChild(last);
  }

  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener('click', function () { current = t.dataset.feed; render(); });
  });
  document.getElementById('prev').addEventListener('click', function () {
    track.scrollBy({ left: -660, behavior: 'smooth' });
  });
  document.getElementById('next').addEventListener('click', function () {
    track.scrollBy({ left: 660, behavior: 'smooth' });
  });

  render();
  fetch('feeds.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) { if (data) { feeds = data; render(); } })
    .catch(function () { /* no feeds.json yet — placeholder slots stay */ });
})();
