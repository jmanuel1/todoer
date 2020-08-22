'use strict';

import { GeneralizedLabel, starredLabel } from '../models/generalized-label';

export default class ChangedThreadService {
  constructor(queueTask, settingsService, databaseStore, threadModel) {
    if (this.constructor._instance !== undefined) {
      return this.constructor._instance;
    }
    this.constructor._instance = this;
    this._subscribers = [];
    this._unlistenToTaskQueue = queueTask.listen(this._onDataChanged,
      this);
    this._settingsService = settingsService;
    this._databaseStore = databaseStore;
    this._threadModel = threadModel;
  }

  _onDataChanged(task) {
    // FIXME: We assume that the account's organization unit is label.
    // https://docs.nylas.com/reference#threads

    const label = this._settingsService.emailLabel;
    if (!isTaskRelatedToLabel(task, label)) {
      return;
    }

    const labelAdded = label.equals(starredLabel) && task.starred ||
      task.labelsToAdd.some(l => label.equals(l.displayName));

    const threadIDs = task.threadIds;
    for (const threadID of threadIDs) {
      // FIXME: We read the *previous* state of the thread here. I think tasks
      // are fired before changes are written to the database.
      this._databaseStore.find(this._threadModel, threadID).then(thread => {
        for (const subscriber of this._subscribers) {
          subscriber(thread, labelAdded);
        }
      });
    }
  }

  listen(subscriber) {
    this._subscribers = (this._subscribers || []).concat([subscriber]);
  }

  destroy() {
    this.constructor._instance = undefined;
    this._unlistenToTaskQueue();
  }
}

function isTaskRelatedToLabel(task, label) {
  return task.starred !== undefined && label.equals(starredLabel) ||
    task.labelsToAdd && [...task.labelsToAdd, ...task.labelsToRemove].some(
      l => label.equals(l.displayName));
}
