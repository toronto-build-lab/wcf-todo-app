/**
 * SOAP Test Harness — TodoService proof of concept
 *
 * Validates the `soap` npm package against the legacy WCF TodoService.svc endpoint.
 * Designed to surface integration issues before wiring the client into the SPA.
 *
 * Usage:
 *   pnpm run client                   — interactive menu
 *   pnpm run client -- --list         — list all todos
 *   pnpm run client -- --create "Buy milk"
 *   pnpm run client -- --edit   <id> "Updated title"
 *   pnpm run client -- --delete <id>
 *   pnpm run client -- --wsdl         — dump discovered WSDL methods (diagnostics)
 *   pnpm run client -- --fault [id]   — intentionally provoke a SOAP fault (diagnostics)
 */

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createClient, type Client } from 'soap';
import { randomUUID } from 'node:crypto';

// ─── Configuration ────────────────────────────────────────────────────────────

const WSDL_URL = 'http://localhost:58332/TodoService.svc?wsdl';

/**
 * WCF DataContract namespace for TodoItem.
 * Required when sending items back to the service so the serializer can
 * match the element to the correct CLR type.
 */
const ITEM_NS = 'http://schemas.datacontract.org/2004/07/TodoWCFService.Models';

// ─── Domain types ─────────────────────────────────────────────────────────────

interface SoapTodoItem {
  ID: string;
  Name: string;
  Notes: string;
  Done: boolean;
}

// Shape the soap package returns for GetTodoItems
interface GetTodoItemsResult {
  GetTodoItemsResult?: {
    TodoItem?: SoapTodoItem | SoapTodoItem[];
  };
}

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
} as const;

const bold = (s: string) => `${c.bold}${s}${c.reset}`;
const dim = (s: string) => `${c.dim}${s}${c.reset}`;
const ok = (s: string) => `${c.green}✔${c.reset} ${s}`;
const fail = (s: string) => `${c.red}✘${c.reset} ${s}`;
const info = (s: string) => `${c.cyan}ℹ${c.reset} ${s}`;

// ─── SOAP client factory ──────────────────────────────────────────────────────

function createSoapClient(wsdlUrl: string): Promise<Client> {
  return new Promise((resolve, reject) => {
    createClient(wsdlUrl, {}, (err, client) => {
      if (err) reject(err);
      else resolve(client);
    });
  });
}

// ─── Service operations ───────────────────────────────────────────────────────

async function listItems(client: Client): Promise<SoapTodoItem[]> {
  const [result] = (await client.GetTodoItemsAsync({})) as [GetTodoItemsResult];
  const raw = result?.GetTodoItemsResult?.TodoItem;
  if (!raw) return [];
  // WCF returns a single object (not array) when only one item exists
  return Array.isArray(raw) ? raw : [raw];
}

async function createItem(
  client: Client,
  name: string,
  notes = '',
): Promise<void> {
  const item: SoapTodoItem = {
    ID: randomUUID(),
    Name: name,
    Notes: notes,
    Done: false,
  };
  await client.CreateTodoItemAsync({
    item: { attributes: { 'xmlns:d': ITEM_NS }, ...item },
  });
}

async function editItem(
  client: Client,
  id: string,
  patch: Partial<Pick<SoapTodoItem, 'Name' | 'Notes' | 'Done'>>,
): Promise<void> {
  const items = await listItems(client);
  const existing = items.find((i) => i.ID === id);
  if (!existing) throw new Error(`No item found with ID: ${id}`);
  const updated: SoapTodoItem = { ...existing, ...patch };
  await client.EditTodoItemAsync({
    item: { attributes: { 'xmlns:d': ITEM_NS }, ...updated },
  });
}

async function deleteItem(client: Client, id: string): Promise<void> {
  await client.DeleteTodoItemAsync({ id });
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function printItems(items: SoapTodoItem[]): void {
  if (items.length === 0) {
    console.log(dim('  (no items)'));
    return;
  }
  for (const item of items) {
    const status = item.Done
      ? `${c.green}[done]${c.reset}`
      : `${c.yellow}[open]${c.reset}`;
    console.log(`  ${status} ${bold(item.Name)}`);
    if (item.Notes) console.log(`         ${dim(item.Notes)}`);
    console.log(`         ${dim('id: ' + item.ID)}`);
  }
}

function printDiagnostics(client: Client): void {
  console.log(bold('\nDiscovered WSDL methods:'));
  const desc = client.describe() as Record<string, unknown>;
  console.log(JSON.stringify(desc, null, 2));

  console.log(bold('\nLast raw request XML:'));
  console.log(dim(client.lastRequest ?? '(none)'));
}

// ─── CLI (non-interactive) ────────────────────────────────────────────────────

async function runCli(client: Client, args: string[]): Promise<void> {
  const flag = args[0];

  if (flag === '--list') {
    console.log(info('Fetching items…'));
    const items = await listItems(client);
    printItems(items);
    console.log(ok(`${items.length} item(s) retrieved`));
  } else if (flag === '--create') {
    const name = args[1];
    const notes = args[2] ?? '';
    if (!name) throw new Error('--create requires a title argument');
    console.log(info(`Creating "${name}"…`));
    await createItem(client, name, notes);
    console.log(ok('Item created'));
  } else if (flag === '--edit') {
    const id = args[1];
    const name = args[2];
    if (!id || !name) throw new Error('--edit requires <id> <new-title>');
    console.log(info(`Editing ${id}…`));
    await editItem(client, id, { Name: name });
    console.log(ok('Item updated'));
  } else if (flag === '--delete') {
    const id = args[1];
    if (!id) throw new Error('--delete requires <id>');
    console.log(info(`Deleting ${id}…`));
    await deleteItem(client, id);
    console.log(ok('Item deleted'));
  } else if (flag === '--wsdl') {
    printDiagnostics(client);
  } else if (flag === '--fault') {
    // Diagnostic: intentionally sends an EditTodoItem request with a non-existent ID
    // to trigger an unhandled ArgumentOutOfRangeException on the service, which WCF
    // wraps as a SOAP fault. Bypasses the harness pre-check intentionally.
    const fakeId = args[1] ?? 'does-not-exist';
    console.log(info(`Sending EditTodoItem with fake ID "${fakeId}" to provoke a SOAP fault…`));
    await client.EditTodoItemAsync({
      item: { attributes: { 'xmlns:d': ITEM_NS }, ID: fakeId, Name: 'fault-test', Notes: '', Done: false },
    });
  } else {
    console.error(fail(`Unknown flag: ${flag}`));
    console.error('Valid flags: --list, --create, --edit, --delete, --wsdl, --fault');
    process.exit(1);
  }
}

// ─── Interactive menu ─────────────────────────────────────────────────────────

async function runMenu(client: Client): Promise<void> {
  const rl = readline.createInterface({ input, output, terminal: true });

  const prompt = async (q: string) => (await rl.question(`${c.cyan}?${c.reset} ${q} `)).trim();

  console.log(`\n${c.magenta}${bold('TodoService SOAP Harness')}${c.reset}`);
  console.log(dim(`Connected to ${WSDL_URL}\n`));

  const menu = `
  ${bold('1')}  List all items
  ${bold('2')}  Create item
  ${bold('3')}  Edit item
  ${bold('4')}  Toggle done/open
  ${bold('5')}  Delete item
  ${bold('6')}  Dump WSDL diagnostics
  ${bold('q')}  Quit
`;

  while (true) {
    console.log(menu);
    const choice = await prompt('Choice:');

    try {
      if (choice === '1') {
        const items = await listItems(client);
        printItems(items);
        console.log(ok(`${items.length} item(s)`));
      } else if (choice === '2') {
        const name = await prompt('Title:');
        if (!name) { console.log(fail('Title is required')); continue; }
        const notes = await prompt('Notes (optional):');
        await createItem(client, name, notes);
        console.log(ok(`Created "${name}"`));
        console.log(dim('Last request XML:'));
        console.log(dim(client.lastRequest ?? ''));
      } else if (choice === '3') {
        const id = await prompt('Item ID to edit:');
        const name = await prompt('New title:');
        const notes = await prompt('New notes (leave blank to keep):');
        const patch: Partial<Pick<SoapTodoItem, 'Name' | 'Notes'>> = {};
        if (name) patch.Name = name;
        if (notes) patch.Notes = notes;
        await editItem(client, id, patch);
        console.log(ok('Updated'));
        console.log(dim('Last request XML:'));
        console.log(dim(client.lastRequest ?? ''));
      } else if (choice === '4') {
        const id = await prompt('Item ID to toggle:');
        const items = await listItems(client);
        const item = items.find((i) => i.ID === id);
        if (!item) { console.log(fail(`ID not found: ${id}`)); continue; }
        await editItem(client, id, { Done: !item.Done });
        console.log(ok(`Toggled to ${!item.Done ? 'done' : 'open'}`));
      } else if (choice === '5') {
        const id = await prompt('Item ID to delete:');
        await deleteItem(client, id);
        console.log(ok('Deleted'));
      } else if (choice === '6') {
        printDiagnostics(client);
      } else if (choice === 'q' || choice === 'Q') {
        console.log('Bye.');
        break;
      } else {
        console.log(fail('Unrecognised choice'));
      }
    } catch (err) {
      console.error(fail('Operation failed:'), (err as Error).message);
      // Print raw SOAP fault if present for diagnosis
      const anyErr = err as Record<string, unknown>;
      if (anyErr['root']) {
        console.error(dim('SOAP fault body:'));
        console.error(dim(JSON.stringify(anyErr['root'], null, 2)));
      }
      if (client.lastRequest) {
        console.error(dim('Last request XML:'));
        console.error(dim(client.lastRequest));
      }
    }
  }

  rl.close();
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Strip node + script path; drop pnpm's '--' separator if present
  const rawArgs = process.argv.slice(2);
  const args = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs;

  console.log(info(`Connecting to WSDL at ${WSDL_URL} …`));

  let client: Client;
  try {
    client = await createSoapClient(WSDL_URL);
    console.log(ok('WSDL loaded and client created'));
  } catch (err) {
    console.error(fail('Failed to connect to WSDL:'), (err as Error).message);
    console.error(
      dim(
        'Is the TodoWCFService running? Start it with:\n' +
          '  cd TodoWCFService && dotnet run',
      ),
    );
    process.exit(1);
    return; // unreachable but satisfies definite-assignment analysis
  }

  if (args.length > 0) {
    try {
      await runCli(client, args);
    } catch (err) {
      console.error(fail((err as Error).message));
      const anyErr = err as Record<string, unknown>;
      if (anyErr['root']) {
        console.error(dim('SOAP fault body:'));
        console.error(dim(JSON.stringify(anyErr['root'], null, 2)));
      }
      if (client.lastRequest) {
        console.error(dim('Last request XML:'));
        console.error(dim(client.lastRequest));
      }
      process.exit(1);
    }
  } else {
    await runMenu(client);
  }
}

main().catch((err) => {
  console.error(fail('Unexpected error:'), err);
  process.exit(1);
});
