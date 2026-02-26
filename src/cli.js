#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { config, loadMessages, saveMessages, loadSpecialDates, saveSpecialDates, loadHistory, ensureDataFiles } = require('./config');
const { send, smsConfigured, messengerConfigured } = require('./senders');
const { start } = require('./scheduler');

const program = new Command();

program
  .name('love-notes')
  .description('Send random love notes to your girlfriend via SMS or Messenger')
  .version('1.0.0');

// ── Start the scheduler ──────────────────────────────────────────────
program
  .command('start')
  .description('Start the scheduler — sends random love notes throughout the day')
  .action(() => {
    start();
  });

// ── Send a test message right now ────────────────────────────────────
program
  .command('test')
  .description('Send a test message immediately')
  .option('-m, --message <text>', 'Custom message to send')
  .action(async (opts) => {
    const text = opts.message || 'This is a test love note! 💕 If you got this, everything is working.';
    console.log(chalk.cyan(`Sending test message: "${text}"`));
    try {
      const results = await send(text);
      results.forEach((r) => {
        console.log(chalk.green(`✓ Sent via ${r.channel}`));
      });
    } catch (err) {
      console.error(chalk.red(`✗ Failed: ${err.message}`));
      process.exit(1);
    }
  });

// ── List all messages ────────────────────────────────────────────────
program
  .command('list')
  .description('List all love note messages')
  .option('-c, --category <cat>', 'Filter by category')
  .action((opts) => {
    const messages = loadMessages();
    let filtered = messages;
    if (opts.category) {
      filtered = messages.filter((m) => m.category === opts.category);
    }

    if (filtered.length === 0) {
      console.log(chalk.yellow('No messages found.'));
      return;
    }

    console.log(chalk.cyan.bold(`\n💌 Love Notes (${filtered.length} total)\n`));

    const categories = [...new Set(filtered.map((m) => m.category))];
    categories.forEach((cat) => {
      console.log(chalk.magenta.bold(`  [${cat}]`));
      filtered
        .filter((m) => m.category === cat)
        .forEach((m) => {
          console.log(chalk.white(`    #${m.id}: ${m.text}`));
        });
      console.log('');
    });
  });

// ── Add a new message ────────────────────────────────────────────────
program
  .command('add')
  .description('Add a new love note message')
  .argument('<text>', 'The message text')
  .option('-c, --category <cat>', 'Message category', 'sweet')
  .action((text, opts) => {
    const messages = loadMessages();
    const maxId = messages.reduce((max, m) => Math.max(max, m.id), 0);
    const newMsg = { id: maxId + 1, text, category: opts.category };
    messages.push(newMsg);
    saveMessages(messages);
    console.log(chalk.green(`✓ Added message #${newMsg.id} [${newMsg.category}]: "${text}"`));
  });

// ── Remove a message ─────────────────────────────────────────────────
program
  .command('remove')
  .description('Remove a love note message by ID')
  .argument('<id>', 'Message ID to remove')
  .action((id) => {
    const messages = loadMessages();
    const numId = parseInt(id, 10);
    const index = messages.findIndex((m) => m.id === numId);
    if (index === -1) {
      console.log(chalk.red(`Message #${id} not found.`));
      return;
    }
    const removed = messages.splice(index, 1)[0];
    saveMessages(messages);
    console.log(chalk.green(`✓ Removed message #${removed.id}: "${removed.text}"`));
  });

// ── Add a special date ───────────────────────────────────────────────
program
  .command('special-date')
  .description('Add a special date (anniversary, birthday) with a bonus message')
  .argument('<month>', 'Month (1-12)')
  .argument('<day>', 'Day of the month')
  .argument('<message>', 'Special message to send on that date')
  .option('-n, --name <name>', 'Name for this date (e.g. "Anniversary")')
  .action((month, day, message, opts) => {
    const dates = loadSpecialDates();
    dates.push({
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      message,
      name: opts.name || 'Special Day',
    });
    saveSpecialDates(dates);
    console.log(chalk.green(`✓ Added special date: ${opts.name || 'Special Day'} on ${month}/${day}`));
    console.log(chalk.white(`  Message: "${message}"`));
  });

// ── List special dates ───────────────────────────────────────────────
program
  .command('special-dates')
  .description('List all configured special dates')
  .action(() => {
    const dates = loadSpecialDates();
    if (dates.length === 0) {
      console.log(chalk.yellow('No special dates configured. Add one with: love-notes special-date <month> <day> <message>'));
      return;
    }
    console.log(chalk.cyan.bold('\n📅 Special Dates\n'));
    dates.forEach((d, i) => {
      console.log(chalk.white(`  ${i + 1}. ${d.name} — ${d.month}/${d.day}`));
      console.log(chalk.gray(`     "${d.message}"`));
    });
    console.log('');
  });

// ── Show send history ────────────────────────────────────────────────
program
  .command('history')
  .description('Show recent send history')
  .option('-n, --count <n>', 'Number of entries to show', '10')
  .action((opts) => {
    const history = loadHistory();
    const count = parseInt(opts.count, 10);
    const recent = history.slice(-count);

    if (recent.length === 0) {
      console.log(chalk.yellow('No messages sent yet.'));
      return;
    }

    console.log(chalk.cyan.bold(`\n📬 Recent History (last ${recent.length})\n`));
    recent.forEach((entry) => {
      const time = new Date(entry.sentAt).toLocaleString();
      const status = entry.error
        ? chalk.red(`✗ ${entry.error}`)
        : chalk.green('✓ sent');
      console.log(chalk.white(`  [${time}] via ${entry.channel} ${status}`));
      console.log(chalk.gray(`    "${entry.message}"`));
    });
    console.log('');
  });

// ── Show current configuration status ────────────────────────────────
program
  .command('status')
  .description('Show current configuration and channel status')
  .action(() => {
    ensureDataFiles();
    const messages = loadMessages();
    const specialDates = loadSpecialDates();
    const history = loadHistory();

    console.log(chalk.cyan.bold('\n💌 Auto Love Notes — Status\n'));

    console.log(chalk.white('  Channel:'), chalk.yellow(config.channel));
    console.log(chalk.white('  SMS configured:'), smsConfigured() ? chalk.green('Yes') : chalk.red('No'));
    console.log(chalk.white('  Messenger configured:'), messengerConfigured() ? chalk.green('Yes') : chalk.red('No'));
    console.log('');
    console.log(chalk.white('  Messages per day:'), chalk.yellow(`${config.schedule.minPerDay}–${config.schedule.maxPerDay}`));
    console.log(chalk.white('  Send window:'), chalk.yellow(`${config.schedule.earliestHour}:00 – ${config.schedule.latestHour}:00`));
    console.log('');
    console.log(chalk.white('  Total messages:'), chalk.yellow(messages.length));
    console.log(chalk.white('  Special dates:'), chalk.yellow(specialDates.length));
    console.log(chalk.white('  Messages sent:'), chalk.yellow(history.length));
    console.log('');
  });

program.parse();
