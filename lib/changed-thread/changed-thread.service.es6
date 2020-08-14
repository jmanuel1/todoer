'use strict';

import { GeneralizedLabel, starredLabel } from '../models/generalized-label';

export default class ChangedThreadService {
  constructor(queueTask, settingsService) {
    if (this.constructor._instance !== undefined) {
      return this.constructor._instance;
    }
    this.constructor._instance = this;
    this._subscribers = [];
    this._unlistenToTaskQueue = queueTask.listen(this._onDataChanged,
      this);
    this._settingsService = settingsService;
  }

  _onDataChanged(task) {
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
    // if (payload.objectClass !== 'Thread') {
    //   return;
    // }
    // // We catch all changes to threads, whether that means stars or labels
    // for (const thread of payload.objects) {
    //   for (const subscriber of this._subscribers) {
    //     subscriber(thread);
    //   }
    // }
  }

  listen(subscriber) {
    this._subscribers = (this._subscribers || []).concat([subscriber]);
  }

  destroy() {
    this.constructor._instance = undefined;
    this._unlistenToTaskQueue();
  }
}