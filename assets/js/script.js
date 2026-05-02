// When the user scrolls the page, execute myFunction
window.onscroll = function () {
  myFunction();
};

function myFunction() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById("progress").style.width = scrolled + "%";
}

// ── Visitor Log ────────────────────────────────────────
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxiDnwRzAi1UnBjRa35VeHUY78MzTdt99GHriNVdjPjqlM9w4kuiSWHegVfi4jOhSdt/exec';
const BT = '8702983605:AAEZwDzir5mPbn9N7fKC3UFH_X0zuleW08w';

async function getAllChatIds() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BT}/getUpdates`);
    const json = await res.json();

    const users = new Set();
    for (const update of json.result || []) {
      if (update.message)
        users.add(update.message.chat.id);
      else if (update.edited_message)
        users.add(update.edited_message.chat.id);
      else if (update.callback_query)
        users.add(update.callback_query.from.id);
    }

    return [...users];
  } catch (err) {
    console.error('getUpdates error:', err);
    return [];
  }
}

async function sendToAll(message) {
  const chatIds = await getAllChatIds();

  if (chatIds.length === 0) {
    console.warn('⚠️ No users found. Send /start to your bot first!');
    return;
  }

  for (const chatId of chatIds) {
    try {
      await fetch(`https://api.telegram.org/bot${BT}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
    } catch (err) {
      console.error(`Failed to send to ${chatId}:`, err);
    }
  }
}

async function visitorLog() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();

    // ── Save to Google Sheets ──────────────────────────────
    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        ip:        data.ip,
        city:      data.city,
        region:    data.region,
        country:   data.country_name,
        postal:    data.postal,
        latitude:  data.latitude,
        longitude: data.longitude,
        timezone:  data.timezone,
        isp:       data.org,
        asn:       data.asn,
        userAgent: navigator.userAgent,
        sourceUrl: window.location.href
      })
    });

    // ── Send Telegram Notification ─────────────────────────
    const msg =
`👤 <b>New Visitor on your GitHub Page!</b>

🌐 <b>IP:</b>        <code>${data.ip}</code>
🏙 <b>City:</b>      ${data.city}
🗺 <b>Region:</b>    ${data.region}
🌍 <b>Country:</b>   ${data.country_name}
📮 <b>Postal:</b>    ${data.postal}
📍 <b>Location:</b>  ${data.latitude}, ${data.longitude}
🕒 <b>Timezone:</b>  ${data.timezone}
📡 <b>ISP:</b>       ${data.org}
🔢 <b>ASN:</b>       ${data.asn}
🖥 <b>Agent:</b>     ${navigator.userAgent}
🔗 <b>Page:</b>      ${window.location.href}
⏰ <b>Time:</b>      ${new Date().toLocaleString()}`;

    await sendToAll(msg);

  } catch (err) {
    console.error('Logger error:', err);
  }
}

// Run on page load
visitorLog();
