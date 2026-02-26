# Auto Love Notes 💌

A configurable app that sends random love notes to your girlfriend via **SMS** (Twilio) or **Facebook Messenger** at random times throughout the day.

## Features

- **Dual channel support** — Send via SMS, Facebook Messenger, or both simultaneously
- **Random scheduling** — Messages sent at random times within your configured window
- **Configurable frequency** — Set min/max messages per day
- **Custom messages** — Add, remove, and categorize your own love notes
- **Special dates** — Configure bonus messages for anniversaries, birthdays, etc.
- **Send history** — Track what was sent and when
- **Anti-repeat** — Avoids sending the same message back-to-back
- **CLI management** — Easy command-line tools to manage everything

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in your config
cp .env.example .env
# Edit .env with your API credentials

# 3. Start sending love notes!
npm start
```

## Setup

### SMS via Twilio

1. Create a [Twilio account](https://www.twilio.com/try-twilio)
2. Get your Account SID, Auth Token, and a phone number
3. Add them to `.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   RECIPIENT_PHONE_NUMBER=+1234567890
   ```

### Facebook Messenger

1. Create a [Facebook App](https://developers.facebook.com/) with the Messenger product
2. Create or link a Facebook Page
3. Generate a Page Access Token
4. Get your girlfriend's PSID (Page-Scoped ID) — she needs to message the page first
5. Add to `.env`:
   ```
   FB_PAGE_ACCESS_TOKEN=EAAxxxxx
   FB_RECIPIENT_ID=123456789
   ```

### Scheduling

Configure in `.env`:
```
MIN_MESSAGES_PER_DAY=2
MAX_MESSAGES_PER_DAY=5
EARLIEST_HOUR=8       # 8:00 AM
LATEST_HOUR=22        # 10:00 PM
CHANNEL=sms           # "sms", "messenger", or "both"
```

## CLI Commands

```bash
# Start the scheduler
node src/cli.js start

# Send a test message right now
node src/cli.js test
node src/cli.js test -m "Custom test message"

# List all messages
node src/cli.js list
node src/cli.js list -c romantic     # filter by category

# Add a new message
node src/cli.js add "You're my sunshine" -c sweet
node src/cli.js add "Can't stop thinking about you" -c flirty

# Remove a message by ID
node src/cli.js remove 5

# Add a special date
node src/cli.js special-date 2 14 "Happy Valentine's Day my love! ❤️" -n "Valentine's Day"
node src/cli.js special-date 6 15 "Happy Anniversary! Every year with you is the best one yet" -n "Anniversary"

# List special dates
node src/cli.js special-dates

# View send history
node src/cli.js history
node src/cli.js history -n 20

# Check configuration status
node src/cli.js status
```

## Message Categories

Messages are organized by category for variety:
- `sweet` — Warm, heartfelt notes
- `romantic` — Deep, romantic expressions
- `flirty` — Playful, flirty messages
- `cute` — Light, adorable messages
- `morning` — Good morning messages

You can add any custom category you want with the `-c` flag.

## Running as a Background Service

To keep it running 24/7, use PM2:

```bash
npm install -g pm2
pm2 start src/index.js --name love-notes
pm2 save
pm2 startup    # auto-start on reboot
```

Or with systemd, Docker, or any process manager of your choice.

## How It Works

1. On startup (and at midnight each day), the scheduler picks a random number of messages to send (between your min/max)
2. It generates random times within your send window for each message
3. At each scheduled time, it picks a random message (avoiding recent repeats) and sends it via your configured channel(s)
4. On special dates, bonus messages are added to the day's schedule
5. All sends are logged to `data/history.json`

## Project Structure

```
├── .env.example          # Environment variable template
├── package.json
├── src/
│   ├── index.js           # Main entry point
│   ├── cli.js             # CLI commands
│   ├── config.js          # Configuration & data management
│   ├── scheduler.js       # Random scheduling engine
│   └── senders/
│       ├── index.js       # Channel router
│       ├── sms.js         # Twilio SMS sender
│       └── messenger.js   # Facebook Messenger sender
└── data/
    ├── messages.json      # Your love notes (auto-created)
    ├── special-dates.json # Special dates config (auto-created)
    └── history.json       # Send history (auto-created)
```
