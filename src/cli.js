#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const {
  config, ensureDataFiles,
  loadMessages, saveMessages,
  loadHistory, loadSettings, saveSettings,
  loadSpecialDates, saveSpecialDates,
  loadInsideJokes, saveInsideJokes,
  loadReasons, saveReasons,
} = require('./config');
const { send, isConfigured } = require('./senders');
const { sendThinkingOfYou } = require('./scheduler');
const { listPhotos } = require('./features/photo-notes');

const program = new Command();

program
  .name('love-notes')
  .description('Send random love notes via Messenger — with AI, weather, quotes, and more')
  .version('2.0.0');

// ── Start ────────────────────────────────────────────────────────────
program
  .command('start')
  .description('Start the scheduler and web dashboard')
  .action(() => {
    require('./index');
  });

// ── Test send ────────────────────────────────────────────────────────
program
  .command('test')
  .description('Send a test message immediately')
  .option('-m, --message <text>', 'Custom message')
  .action(async (opts) => {
    const text = opts.message || 'Test love note! 💕 Everything is working.';
    console.log(chalk.cyan(`Sending: "${text}"`));
    try {
      const result = await send(text);
      console.log(chalk.green(`✓ Sent via ${result.channel}`));
    } catch (err) {
      console.error(chalk.red(`✗ Failed: ${err.message}`));
      process.exit(1);
    }
  });

// ── Thinking of you ──────────────────────────────────────────────────
program
  .command('think')
  .description('Send a "thinking of you" message now (random or custom)')
  .option('-m, --message <text>', 'Custom message')
  .action(async (opts) => {
    try {
      await sendThinkingOfYou(opts.message || null);
      console.log(chalk.green('✓ Sent!'));
    } catch (err) {
      console.error(chalk.red(`✗ Failed: ${err.message}`));
    }
  });

// ── List messages ────────────────────────────────────────────────────
program
  .command('list')
  .description('List all love note messages')
  .option('-c, --category <cat>', 'Filter by category')
  .action((opts) => {
    const messages = loadMessages();
    let filtered = messages;
    if (opts.category) filtered = messages.filter((m) => m.category === opts.category);

    if (filtered.length === 0) {
      console.log(chalk.yellow('No messages found.'));
      return;
    }

    console.log(chalk.cyan.bold(`\n💌 Love Notes (${filtered.length} total)\n`));
    const categories = [...new Set(filtered.map((m) => m.category))];
    categories.forEach((cat) => {
      console.log(chalk.magenta.bold(`  [${cat}]`));
      filtered.filter((m) => m.category === cat).forEach((m) => {
        const tod = m.timeOfDay && m.timeOfDay !== 'any' ? chalk.gray(` (${m.timeOfDay})`) : '';
        console.log(chalk.white(`    #${m.id}: ${m.text}${tod}`));
      });
      console.log('');
    });
  });

// ── Add message ──────────────────────────────────────────────────────
program
  .command('add')
  .description('Add a new love note')
  .argument('<text>', 'Message text')
  .option('-c, --category <cat>', 'Category', 'sweet')
  .option('-t, --time <tod>', 'Time of day: morning, afternoon, evening, any', 'any')
  .action((text, opts) => {
    const messages = loadMessages();
    const maxId = messages.reduce((max, m) => Math.max(max, m.id), 0);
    const msg = { id: maxId + 1, text, category: opts.category, timeOfDay: opts.time };
    messages.push(msg);
    saveMessages(messages);
    console.log(chalk.green(`✓ Added #${msg.id} [${msg.category}] (${msg.timeOfDay}): "${text}"`));
  });

// ── Remove message ───────────────────────────────────────────────────
program
  .command('remove')
  .description('Remove a message by ID')
  .argument('<id>')
  .action((id) => {
    const messages = loadMessages();
    const idx = messages.findIndex((m) => m.id === parseInt(id, 10));
    if (idx === -1) return console.log(chalk.red(`#${id} not found.`));
    const removed = messages.splice(idx, 1)[0];
    saveMessages(messages);
    console.log(chalk.green(`✓ Removed #${removed.id}: "${removed.text}"`));
  });

// ── Inside jokes ─────────────────────────────────────────────────────
program
  .command('joke')
  .description('Add an inside joke')
  .argument('<text>')
  .option('-c, --context <ctx>', 'Context for the joke')
  .action((text, opts) => {
    const jokes = loadInsideJokes();
    jokes.push({ text, context: opts.context || '', addedAt: new Date().toISOString() });
    saveInsideJokes(jokes);
    console.log(chalk.green(`✓ Inside joke added: "${text}"`));
  });

program
  .command('jokes')
  .description('List inside jokes')
  .action(() => {
    const jokes = loadInsideJokes();
    if (jokes.length === 0) return console.log(chalk.yellow('No inside jokes yet.'));
    console.log(chalk.cyan.bold('\n😂 Inside Jokes\n'));
    jokes.forEach((j, i) => {
      console.log(chalk.white(`  ${i + 1}. ${j.text}`));
      if (j.context) console.log(chalk.gray(`     (${j.context})`));
    });
    console.log('');
  });

// ── Reasons ──────────────────────────────────────────────────────────
program
  .command('reason')
  .description('Add a "Reason I love you"')
  .argument('<text>')
  .action((text) => {
    const data = loadReasons();
    data.reasons.push(text);
    saveReasons(data);
    console.log(chalk.green(`✓ Reason #${data.reasons.length} added: "${text}"`));
  });

// ── Special dates ────────────────────────────────────────────────────
program
  .command('special-date')
  .description('Add a special date with bonus message')
  .argument('<month>')
  .argument('<day>')
  .argument('<message>')
  .option('-n, --name <name>', 'Name for this date', 'Special Day')
  .action((month, day, message, opts) => {
    const dates = loadSpecialDates();
    dates.push({ month: parseInt(month, 10), day: parseInt(day, 10), message, name: opts.name });
    saveSpecialDates(dates);
    console.log(chalk.green(`✓ ${opts.name} on ${month}/${day}: "${message}"`));
  });

// ── DND ──────────────────────────────────────────────────────────────
program
  .command('dnd')
  .description('Toggle Do Not Disturb')
  .option('-h, --hours <n>', 'Hours to pause')
  .option('--off', 'Turn off DND')
  .action((opts) => {
    const settings = loadSettings();
    if (opts.off) {
      settings.dnd = { enabled: false, until: null };
      saveSettings(settings);
      console.log(chalk.green('✓ DND off'));
    } else {
      settings.dnd.enabled = true;
      if (opts.hours) {
        settings.dnd.until = new Date(Date.now() + parseInt(opts.hours, 10) * 3600000).toISOString();
        console.log(chalk.yellow(`🔕 DND on for ${opts.hours} hours`));
      } else {
        settings.dnd.until = null;
        console.log(chalk.yellow('🔕 DND on (until you turn it off)'));
      }
      saveSettings(settings);
    }
  });

// ── History ──────────────────────────────────────────────────────────
program
  .command('history')
  .description('Show send history')
  .option('-n, --count <n>', 'Entries to show', '10')
  .action((opts) => {
    const history = loadHistory();
    const count = parseInt(opts.count, 10);
    const recent = history.slice(-count);

    if (recent.length === 0) return console.log(chalk.yellow('No messages sent yet.'));

    console.log(chalk.cyan.bold(`\n📬 Recent History (${recent.length})\n`));
    recent.forEach((entry) => {
      const time = new Date(entry.sentAt).toLocaleString();
      const status = entry.error ? chalk.red(`✗ ${entry.error}`) : chalk.green('✓');
      const type = entry.type ? chalk.gray(`[${entry.type}]`) : '';
      console.log(chalk.white(`  [${time}] ${status} ${type}`));
      console.log(chalk.gray(`    "${entry.message}"`));
    });
    console.log('');
  });

// ── Status ───────────────────────────────────────────────────────────
program
  .command('status')
  .description('Show configuration status')
  .action(() => {
    ensureDataFiles();
    const messages = loadMessages();
    const settings = loadSettings();
    const history = loadHistory();
    const photos = listPhotos();
    const jokes = loadInsideJokes();
    const reasons = loadReasons();

    console.log(chalk.cyan.bold('\n💌 Auto Love Notes v2.0 — Status\n'));

    console.log(chalk.white('  Messenger:'), isConfigured() ? chalk.green('Connected') : chalk.red('Not configured'));
    console.log(chalk.white('  DND:'), settings.dnd.enabled ? chalk.yellow('Active') : chalk.green('Off'));
    console.log('');
    console.log(chalk.white('  Messages/day:'), chalk.yellow(`${config.schedule.minPerDay}–${config.schedule.maxPerDay}`));
    console.log(chalk.white('  Send window:'), chalk.yellow(`${config.schedule.earliestHour}:00 – ${config.schedule.latestHour}:00`));
    console.log('');
    console.log(chalk.white('  Love notes:'), chalk.yellow(messages.length));
    console.log(chalk.white('  Inside jokes:'), chalk.yellow(jokes.length));
    console.log(chalk.white('  Reasons:'), chalk.yellow(reasons.reasons.length));
    console.log(chalk.white('  Photos:'), chalk.yellow(photos.length));
    console.log(chalk.white('  Total sent:'), chalk.yellow(history.length));
    console.log('');

    const enabled = Object.entries(settings.features).filter(([, v]) => v).map(([k]) => k);
    console.log(chalk.white('  Features:'), chalk.yellow(enabled.join(', ')));

    if (config.anniversaryDate) {
      const days = Math.floor((Date.now() - new Date(config.anniversaryDate).getTime()) / 86400000);
      console.log(chalk.white('  Days together:'), chalk.magenta(days));
    }
    console.log('');
  });

program.parse();
