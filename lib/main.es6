import { ComponentRegistry, DatabaseStore, WorkspaceStore, PreferencesUIStore, React } from 'mailspring-exports';

// for async/await
import 'babel-polyfill';

import queue from 'async/queue';
import asyncify from 'async/asyncify';

import StarredEmailService from './starred-emails/starred-email.service';
import SettingsService from './settings/settings.service';
import Settings from './ui/settings/settings';
import { toTodo, save, remove, backup } from './email-to-todo/email-to-todo';
import debug from './dev/debug';
import { starredLabel } from './models/generalized-label';

let starredEmailService, settingsService, preferencesTab;

/* Our package configuration. */
export const config = {
  todoFilePath: {
    type: 'string',
    title: 'Path to todo.txt',
    default: '~/todo.txt',
    description: 'This should be the full path to your todo.txt',
  },
  emailLabel: {
    type: 'string',
    title: 'TODO label',
    default: 'Follow-up',
    description: 'Email label that Todoer should watch for emails'
  },
  useStarsForLabel : {
    type: 'boolean',
    title: 'Watch starred emails',
    default: false,
    description: 'Whether Todoer should watch for emails that are starred'
  }
}

// Activate is called when the package is loaded. If your package previously
// saved state using `serialize` it is provided.
//
export async function activate() {
  settingsService = new SettingsService(AppEnv.config);

  // back up the user's todo before we do anything that might damage it
  // TODO: Back up on every modification
  // TODO: Keep previous revisions (timestamp?)
  const todoFilePath = settingsService.todoFilePath;
  await backup(todoFilePath, todoFilePath + '.backup');

  preferencesTab = new PreferencesUIStore.TabItem({
    tabId: 'Todoer',
    displayName: 'Todoer',
    componentClassFn: () => settingsService.injectInto(Settings, React)
  });
  PreferencesUIStore.registerPreferencesTab(preferencesTab);
  starredEmailService = new StarredEmailService(DatabaseStore);

  // To make sure there is only one part of the process accessing the todo file
  // at a time, we use a queue. Without this, the file could get corrupted.
  const todoQueue = queue(asyncify(async thread => {
    // NOTE: Assume that the account's organization unit is label.
    // https://docs.nylas.com/reference#threads
    const { id, labels } = thread;
    let addToTodo = false;
    if (settingsService.emailLabel.equals(starredLabel) && thread.starred) {
      addToTodo = true;
    }
    for (let label of labels) {
      if (settingsService.emailLabel.toString() === label.displayName) {
        addToTodo = true;
      }
    }
    if (addToTodo) {
      const { subject, firstMessageTimestamp: date } = thread;
      const todo = toTodo({ subject, date, id });
      debug('entering save')
      await save(todo, settingsService.todoFilePath);
      debug('exiting save')
      return;
    }
    debug('entering remove')
    await remove(id, settingsService.todoFilePath);
  }), 1);

  starredEmailService.listen(thread => todoQueue.push(thread));
}

// Serialize is called when your package is about to be unmounted.
// You can return a state object that will be passed back to your package
// when it is re-activated.
//
export function serialize() {}

// This **optional** method is called when the window is shutting down,
// or when your package is being updated or disabled. If your package is
// watching any files, holding external resources, providing commands or
// subscribing to events, release them here.
//
export function deactivate() {
  starredEmailService.destroy();
  SettingsService.destroy();
  PreferencesUIStore.unregisterPreferencesTab(preferencesTab.sectionId);
}
