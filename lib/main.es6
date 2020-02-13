import { ComponentRegistry, DatabaseStore, WorkspaceStore, PreferencesUIStore, React } from 'mailspring-exports';

// for async/await
import 'babel-polyfill';

import StarredEmailService from './starred-emails/starred-email.service';
import SettingsService from './settings/settings.service';
import Settings from './ui/settings/settings';
import { toTodo, save, remove } from './email-to-todo/email-to-todo';

let starredEmailService, settingsService, preferencesTab;

/* Our package configuration. */
export const config = {
  todoFilePath: {
    type: 'string',
    title: 'Path to todo.txt',
    description: 'This should be the full path to your todo.txt'
  }
}

// Activate is called when the package is loaded. If your package previously
// saved state using `serialize` it is provided.
//
export function activate() {
  preferencesTab = new PreferencesUIStore.TabItem({
    tabId: 'Todoer',
    displayName: 'Todoer',
    componentClassFn: () => settingsService.injectInto(Settings, React)
  });
  PreferencesUIStore.registerPreferencesTab(preferencesTab);
  starredEmailService = new StarredEmailService(DatabaseStore);
  starredEmailService.listen(async thread => {
    const { id } = thread;
    if (thread.starred) {
      const { subject, firstMessageTimestamp: date } = thread;
      const todo = toTodo({ subject, date, id });
      await save(todo, settingsService.todoFilePath);
      return;
    }
    await remove(id, settingsService.todoFilePath);
  });
  settingsService = new SettingsService(AppEnv.config);
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
  settingsService.destroy();
  PreferencesUIStore.unregisterPreferencesTab(preferencesTab.sectionId);
}
