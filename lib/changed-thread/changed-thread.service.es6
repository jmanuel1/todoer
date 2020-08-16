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
    let shouldTrigger = false;
    console.debug(true, label);
    if (task.starred !== undefined && label.equals(starredLabel)) {
      console.debug(true, 'relevant to stars');
      shouldTrigger = true;
    } else if (task.labelsToAdd && task.labelsToAdd.some(l => new GeneralizedLabel(l.displayName).equals(label)) || task.labelsToRemove && task.labelsToRemove.some(l => new GeneralizedLabel(l.displayName).equals(label))) {
      console.debug(true, 'relevant to label');
      shouldTrigger = true;
    }
    if (!shouldTrigger) {
      console.debug(true, 'irrelevant');
      return;
    }

    const threadIDs = task.threadIds;
    for (const threadID of threadIDs) {
      // FIXME: We read the *previous* state of the thread here. I think tasks
      // are fired before changes are written to the database.
      this._databaseStore.find(this._threadModel, threadID).then(thread => {
        for (const subscriber of this._subscribers) {
          subscriber(thread);
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