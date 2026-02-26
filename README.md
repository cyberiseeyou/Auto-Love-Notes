# Auto Love Notes v2.0 💌

A configurable app that sends random love notes to your girlfriend via **Facebook Messenger** at random times throughout the day — powered by AI, weather awareness, and a mobile-friendly dashboard.

## Features

- **AI-Generated Messages** — Claude creates fresh, unique love notes so she never gets a repeat
- **Weather-Aware Notes** — Sends context-aware messages based on local weather
- **Time-of-Day Awareness** — Morning messages in the morning, romantic notes in the evening
- **"Thinking of You" Button** — Quick-send from the dashboard or CLI whenever you want
- **Do Not Disturb** — Pause sending during meetings, exams, or sleep with timed DND
- **Photo Notes** — Randomly attaches photos from your collection (selfies, memories, memes)
- **"Reason I Love You" Series** — Numbered sequence: "Reason #47 I love you: ..."
- **Daily Compliment Combos** — Pairs a compliment with a love note
- **Inside Joke Rotation** — Send your private inside jokes
- **Romantic Quotes** — 15 built-in quotes from famous authors, easily add your own
- **Special Dates** — Bonus messages on anniversaries, birthdays, Valentine's Day
- **Mobile Dashboard** — Beautiful phone-friendly web UI to manage everything
- **Docker Support** — One command deploy

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your Facebook and API credentials

# 3. Launch (scheduler + dashboard)
npm start
# Dashboard runs at http://localhost:3000
```

## Setup

### Facebook Messenger

1. Create a [Facebook App](https://developers.facebook.com/) with the Messenger product
2. Create or link a Facebook Page
3. Generate a Page Access Token
4. Get your girlfriend's PSID (she needs to message the page first)
5. Add to `.env`:
   ```
   FB_PAGE_ACCESS_TOKEN=EAAxxxxx
   FB_RECIPIENT_ID=123456789
   ```

### AI-Generated Messages (Optional)

1. Get an API key from [Anthropic](https://console.anthropic.com/)
2. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```

### Weather Awareness (Optional)

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Add to `.env`:
   ```
   OPENWEATHER_API_KEY=xxxxx
   WEATHER_CITY=New York
   WEATHER_UNITS=imperial
   ```

### Scheduling

```
MIN_MESSAGES_PER_DAY=2
MAX_MESSAGES_PER_DAY=5
EARLIEST_HOUR=8       # 8:00 AM
LATEST_HOUR=22        # 10:00 PM
```

### Personalization

```
PARTNER_NAME=babe
YOUR_NAME=John
ANNIVERSARY_DATE=2024-01-01   # For "days together" counter
```

### Dashboard Security

```
DASHBOARD_PORT=3000
DASHBOARD_PIN=1234     # Optional PIN protection
```

## Mobile Dashboard (PWA)

The web dashboard is a full **Progressive Web App** — installable on Android and iOS directly from the browser. Access it at `http://your-server:3000`.

On Android: Open in Chrome > tap "Install" or "Add to Home Screen". It will look and feel like a native app with an icon, splash screen, and offline support.

From the dashboard you can:
- **Send "Thinking of You"** — One tap to send a love note right now
- **Toggle DND** — Pause for 1h, 2h, 4h, or indefinitely
- **Manage messages** — Add/remove love notes, inside jokes, reasons, compliments, quotes
- **Toggle features** — Enable/disable AI, weather, photos, etc.
- **View history** — See what was sent and when
- **See stats** — Messages scheduled today, total sent, days together

## Android App (Native)

A full native Android app built with Expo (React Native). Lives in the `mobile/` directory.

### Setup

```bash
cd mobile
npm install

# Run in development (requires Expo Go on your phone)
npm start
# Scan the QR code with Expo Go

# Build an APK you can install directly
npx eas build --platform android --profile preview
```

### Features
- **Home** — "Thinking of You" button, stats, DND toggle, days counter
- **Content** — Tabbed interface for Messages, Inside Jokes, Reasons, Compliments, Quotes
- **History** — Full send history with timestamps and message types
- **Settings** — Server URL config, PIN, feature toggles
- **Push Notifications** — Get notified when messages are sent

### How it works
The Android app connects to your server's REST API. In the Settings tab, enter your server URL (e.g., `http://192.168.1.100:3000`) and optional PIN. Everything syncs in real-time.

## CLI Commands

```bash
# Start everything (scheduler + dashboard)
node src/cli.js start

# Quick send
node src/cli.js think                           # Random "thinking of you"
node src/cli.js think -m "Missing you so much"  # Custom message
node src/cli.js test                            # Test message

# Messages
node src/cli.js list                            # List all
node src/cli.js list -c romantic                # Filter by category
node src/cli.js add "You're my sunshine" -c sweet -t morning
node src/cli.js remove 5

# Inside jokes
node src/cli.js joke "Remember the waffle incident 😂"
node src/cli.js jokes

# Reasons I love you
node src/cli.js reason "the way you dance when you think no one is watching"

# Special dates
node src/cli.js special-date 2 14 "Happy Valentine's Day! ❤️" -n "Valentine's Day"

# Do Not Disturb
node src/cli.js dnd                  # Toggle on (indefinite)
node src/cli.js dnd -h 2             # On for 2 hours
node src/cli.js dnd --off            # Turn off

# History & status
node src/cli.js history
node src/cli.js status
```

## Message Types & Weights

The scheduler randomly picks what type of message to send based on configurable weights:

| Type | Default Weight | Description |
|------|---------------|-------------|
| Custom notes | 40 | Your hand-written love notes |
| AI-generated | 20 | Fresh notes from Claude AI |
| Quotes | 10 | Romantic quotes from famous people |
| Reasons | 10 | "Reason #N I love you: ..." series |
| Compliments | 10 | Compliment + love note combos |
| Inside jokes | 10 | Your private inside jokes |

Adjust weights in the dashboard's Features tab or in `data/settings.json`.

## Photo Notes

Drop photos into the `photos/` directory (jpg, png, gif, webp). The app will randomly attach one to ~20% of messages. You can also upload photos from the dashboard.

## Docker

```bash
# Build and run
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The `data/` and `photos/` directories are mounted as volumes so everything persists across restarts.

## How It Works

1. On startup (and midnight daily), the scheduler picks a random number of messages between your min/max
2. It generates random send times within your time window
3. At each time, it checks DND, picks a message type by weight, considers time-of-day and weather
4. Sends via Facebook Messenger, occasionally attaching a photo
5. On special dates, bonus messages are added to the schedule
6. Everything is logged to history

## Project Structure

```
├── .env.example           # Config template
├── docker-compose.yml     # Docker config
├── Dockerfile
├── package.json
├── src/
│   ├── index.js           # Entry point (scheduler + dashboard)
│   ├── cli.js             # CLI commands
│   ├── config.js          # Config & data management
│   ├── scheduler.js       # Random scheduling engine with DND
│   ├── senders/
│   │   ├── index.js       # Send router
│   │   └── messenger.js   # Facebook Messenger (text + photos)
│   ├── features/
│   │   ├── ai-generator.js    # Claude AI message generation
│   │   ├── weather.js         # Weather-aware messages
│   │   ├── quotes.js          # Romantic quote pool
│   │   ├── reasons.js         # "Reasons I love you" series
│   │   ├── compliments.js     # Compliment + note combos
│   │   ├── inside-jokes.js    # Inside joke rotation
│   │   └── photo-notes.js     # Photo attachment support
│   └── web/
│       ├── server.js          # Express server
│       ├── routes.js          # REST API
│       └── public/
│           ├── index.html     # PWA dashboard
│           ├── manifest.json  # PWA manifest
│           └── sw.js          # Service worker
├── mobile/                # Native Android app (Expo)
│   ├── App.js             # App entry + navigation
│   ├── app.json           # Expo config
│   ├── eas.json           # EAS Build config
│   └── src/
│       ├── api.js          # REST API client
│       ├── theme.js        # Design tokens
│       ├── screens/        # Home, Content, History, Settings
│       └── components/     # Card, Toggle, ListItem, AddForm, StatBox
├── data/                  # Auto-created JSON data
└── photos/                # Drop your photos here
```
